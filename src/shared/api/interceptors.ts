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
      if (error?.response?.status === 401) onUnauthorized();
      return Promise.reject(error);
    }
  );
}
