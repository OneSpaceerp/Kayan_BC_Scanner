import { useAuthStore } from "@/modules/auth/store/authStore";
import type { AxiosInstance } from "axios";
import type { ERPNextSession } from "@/shared/types/erpnext";
import type { AuthStatus } from "@/modules/auth/store/authStore";
import type { AuthErrorCode } from "@/modules/auth/api/authApi";

export interface UseAuthReturn {
  session: ERPNextSession | null;
  client: AxiosInstance | null;
  status: AuthStatus;
  error: AuthErrorCode | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (serverUrl: string, email: string, password: string) => Promise<void>;
  logout: (opts?: { force?: boolean }) => Promise<void>;
  restore: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const { session, client, status, error, login, logout, restore, clearError } =
    useAuthStore();
  return {
    session,
    client,
    status,
    error,
    isAuthenticated: status === "authenticated",
    isLoading: status === "idle" || status === "loading",
    login,
    logout,
    restore,
    clearError,
  };
}
