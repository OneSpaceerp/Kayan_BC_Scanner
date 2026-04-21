import axios, { isAxiosError, type AxiosInstance } from "axios";
import { createAnonClient } from "@/shared/api/erpnextClient";
import { ENDPOINTS } from "@/shared/api/endpoints";

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface LoginResult {
  message: string;
  full_name: string;
  home_page?: string;
}

export interface UserRecord {
  api_key: string;
  full_name: string;
}

// ─── Error classification ─────────────────────────────────────────────────────

export type AuthErrorCode = "invalidCredentials" | "unreachable" | "sessionExpired";

export function classifyAuthError(error: unknown): AuthErrorCode {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return "invalidCredentials";
    // Frappe v15+ returns 417 for invalid/expired token auth
    if (status === 417) return "invalidCredentials";
    // No response = network down or CORS block
    return "unreachable";
  }
  return "unreachable";
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Step 1 of the login flow.
 * Uses cookie-based auth; `client` is injectable for testing.
 */
export async function login(
  baseURL: string,
  usr: string,
  pwd: string,
  client?: AxiosInstance
): Promise<LoginResult> {
  const http = client ?? createAnonClient(baseURL);
  const body = new URLSearchParams({ usr, pwd });
  const res = await http.post<LoginResult>(ENDPOINTS.login, body);
  return res.data;
}

/**
 * Step 2: generate (or regenerate) the api_secret for `email`.
 * Must be called immediately after `login` while the session cookie is live.
 */
export async function generateKeys(
  baseURL: string,
  email: string,
  client?: AxiosInstance
): Promise<string> {
  const http = client ?? createAnonClient(baseURL);
  const body = new URLSearchParams({ user: email });
  const res = await http.post<{ message: { api_secret: string } }>(
    ENDPOINTS.generateKeys,
    body
  );
  return res.data.message.api_secret;
}

/**
 * Step 3: read the user's api_key and full_name from the User doctype.
 * Also called immediately after login (cookie still live).
 */
export async function fetchUser(
  baseURL: string,
  email: string,
  client?: AxiosInstance
): Promise<UserRecord> {
  const http = client ?? createAnonClient(baseURL);
  const res = await http.get<{ data: UserRecord }>(ENDPOINTS.user(email), {
    params: { fields: JSON.stringify(["api_key", "full_name"]) },
  });
  return res.data.data;
}

/**
 * Validates a live session by checking which user is currently logged in.
 * Uses the authenticated (token) client.
 */
export async function getLoggedUser(client: AxiosInstance): Promise<string> {
  const res = await client.get<{ message: string }>(ENDPOINTS.getLoggedUser);
  return res.data.message;
}

/**
 * Convenience: build a minimal axios instance for one-off validation.
 * Useful when no authenticated client is available yet.
 */
export function buildValidationClient(baseURL: string): AxiosInstance {
  return axios.create({ baseURL, headers: { Accept: "application/json" } });
}
