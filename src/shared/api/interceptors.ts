import type { AxiosInstance } from "axios";

/**
 * Attaches a response interceptor that calls `onUnauthorized` when any
 * request receives a 401. Applied in the auth store (Milestone 4).
 */
export function apply401Interceptor(
  client: AxiosInstance,
  onUnauthorized: () => void
): number {
  return client.interceptors.response.use(
    (res) => res,
    (error) => {
      // Frappe v15+ uses 417 for token auth failures in addition to 401
      const status = error?.response?.status;
      if (status === 401 || status === 417) onUnauthorized();
      return Promise.reject(error);
    }
  );
}
