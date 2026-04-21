import axios, { type AxiosInstance } from "axios";

/** Authenticated client — uses token auth for all requests. */
export function createErpClient(
  baseURL: string,
  apiKey: string,
  apiSecret: string
): AxiosInstance {
  return axios.create({
    baseURL,
    headers: {
      Authorization: `token ${apiKey}:${apiSecret}`,
      Accept: "application/json",
    },
  });
}

/**
 * Anonymous client — used for login and the immediate post-login calls
 * (generateKeys / fetchUser) which rely on cookie-based auth.
 */
export function createAnonClient(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    withCredentials: true,
    headers: { Accept: "application/json" },
  });
}

/**
 * Validates the server URL per SEC-1.
 * Throws if the URL is non-HTTPS outside of localhost / dev mode.
 */
export function validateServerUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("INVALID_URL");
  }

  const isLocal =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname.endsWith(".local");

  if (parsed.protocol !== "https:" && !isLocal && !import.meta.env.DEV) {
    throw new Error("SERVER_MUST_BE_HTTPS");
  }

  return parsed;
}
