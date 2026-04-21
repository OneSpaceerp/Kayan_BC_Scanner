import { create } from "zustand";
import type { AxiosInstance } from "axios";
import { createErpClient, validateServerUrl } from "@/shared/api/erpnextClient";
import { apply401Interceptor } from "@/shared/api/interceptors";
import { login as apiLogin, generateKeys, fetchUser, getLoggedUser, classifyAuthError } from "@/modules/auth/api/authApi";
import { encryptSession, decryptSession } from "@/shared/utils/crypto";
import { db } from "@/offline/db";
import type { ERPNextSession } from "@/shared/types/erpnext";
import type { AuthErrorCode } from "@/modules/auth/api/authApi";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  session: ERPNextSession | null;
  client: AxiosInstance | null;
  status: AuthStatus;
  error: AuthErrorCode | null;
  login: (serverUrl: string, email: string, password: string) => Promise<void>;
  logout: (opts?: { force?: boolean }) => Promise<void>;
  restore: () => Promise<void>;
  clearError: () => void;
}

function buildClient(session: ERPNextSession, onUnauthorized: () => void): AxiosInstance {
  const client = createErpClient(session.server_url, session.api_key, session.api_secret);
  apply401Interceptor(client, onUnauthorized);
  return client;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  client: null,
  status: "idle",
  error: null,

  clearError: () => set({ error: null }),

  login: async (serverUrl, email, password) => {
    set({ status: "loading", error: null });
    try {
      validateServerUrl(serverUrl);

      // Step 1 — cookie-based login
      await apiLogin(serverUrl, email, password);

      // Step 2 — generate (or rotate) api_secret; also sets api_key on first use
      const apiSecret = await generateKeys(serverUrl, email);

      // Step 3 — read api_key after generateKeys has committed to the DB.
      // Must be sequential: if the user has no api_key yet, generateKeys creates
      // it, and a parallel fetchUser would race and return an empty api_key.
      const userRecord = await fetchUser(serverUrl, email);

      if (!userRecord.api_key) {
        throw new Error("api_key missing — generateKeys may not have committed yet");
      }

      const session: ERPNextSession = {
        server_url: serverUrl,
        email,
        full_name: userRecord.full_name,
        api_key: userRecord.api_key,
        api_secret: apiSecret,
        created_at: new Date().toISOString(),
      };

      // Persist encrypted
      const row = await encryptSession(session);
      await db.session.put(row);

      const client = buildClient(session, () => get().logout({ force: true }));

      set({ session, client, status: "authenticated", error: null });
    } catch (err) {
      const code = classifyAuthError(err);
      set({ status: "unauthenticated", error: code });
      throw err;
    }
  },

  logout: async ({ force } = {}) => {
    if (!force) {
      const pending = await db.pendingLeads.where("status").anyOf(["pending", "in_flight"]).count();
      if (pending > 0) {
        const confirmed = window.confirm(
          `You have ${pending} unsynced lead(s). Logout anyway?`
        );
        if (!confirmed) return;
      }
    }
    await db.session.clear();
    await db.cryptoKey.clear();
    set({ session: null, client: null, status: "unauthenticated", error: null });
  },

  restore: async () => {
    if (get().status !== "idle") return;
    set({ status: "loading" });
    try {
      const row = await db.session.get("current");
      if (!row) {
        set({ status: "unauthenticated" });
        return;
      }
      const session = await decryptSession(row);
      const client = buildClient(session, () => get().logout({ force: true }));

      // Validate the session is still alive
      await getLoggedUser(client);

      set({ session, client, status: "authenticated" });
    } catch {
      // 401 from getLoggedUser — or decryption failure
      await db.session.clear();
      set({ status: "unauthenticated" });
    }
  },
}));
