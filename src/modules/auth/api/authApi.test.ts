import { describe, it, expect, beforeEach, afterEach } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
  login,
  generateKeys,
  fetchUser,
  getLoggedUser,
  classifyAuthError,
} from "./authApi";
import { ENDPOINTS } from "@/shared/api/endpoints";

const BASE = "https://erp.example.com";

// Helper: build a mock axios instance
function buildMock() {
  const instance = axios.create({ baseURL: BASE });
  const mock = new MockAdapter(instance);
  return { instance, mock };
}

// ─── classifyAuthError ────────────────────────────────────────────────────────

describe("classifyAuthError", () => {
  it("returns invalidCredentials for 401", () => {
    const err = Object.assign(new Error(), {
      isAxiosError: true,
      response: { status: 401 },
    });
    expect(classifyAuthError(err)).toBe("invalidCredentials");
  });

  it("returns invalidCredentials for 403", () => {
    const err = Object.assign(new Error(), {
      isAxiosError: true,
      response: { status: 403 },
    });
    expect(classifyAuthError(err)).toBe("invalidCredentials");
  });

  it("returns unreachable when no response (network/CORS error)", () => {
    const err = Object.assign(new Error("Network Error"), {
      isAxiosError: true,
      response: undefined,
    });
    expect(classifyAuthError(err)).toBe("unreachable");
  });

  it("returns unreachable for non-Axios errors", () => {
    expect(classifyAuthError(new Error("random"))).toBe("unreachable");
    expect(classifyAuthError("string error")).toBe("unreachable");
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe("login", () => {
  let mock: MockAdapter;
  let instance: ReturnType<typeof axios.create>;

  beforeEach(() => {
    ({ instance, mock } = buildMock());
  });
  afterEach(() => mock.restore());

  it("returns LoginResult on 200", async () => {
    mock.onPost(ENDPOINTS.login).reply(200, {
      message: "Logged In",
      full_name: "Ahmed Hassan",
      home_page: "/app",
    });
    const result = await login(BASE, "ahmed@example.com", "password123", instance);
    expect(result.message).toBe("Logged In");
    expect(result.full_name).toBe("Ahmed Hassan");
  });

  it("throws on 401 (wrong credentials)", async () => {
    mock.onPost(ENDPOINTS.login).reply(401, { message: "Incorrect password" });
    await expect(login(BASE, "ahmed@example.com", "wrong", instance)).rejects.toThrow();
  });

  it("throws on network error", async () => {
    mock.onPost(ENDPOINTS.login).networkError();
    await expect(login(BASE, "ahmed@example.com", "pw", instance)).rejects.toThrow();
  });

  it("throws on 5xx server error", async () => {
    mock.onPost(ENDPOINTS.login).reply(500, { message: "Internal Server Error" });
    await expect(login(BASE, "ahmed@example.com", "pw", instance)).rejects.toThrow();
  });
});

// ─── generateKeys ─────────────────────────────────────────────────────────────

describe("generateKeys", () => {
  let mock: MockAdapter;
  let instance: ReturnType<typeof axios.create>;

  beforeEach(() => {
    ({ instance, mock } = buildMock());
  });
  afterEach(() => mock.restore());

  it("returns api_secret on success", async () => {
    mock.onPost(ENDPOINTS.generateKeys).reply(200, {
      message: { api_secret: "s3cr3t_value" },
    });
    const secret = await generateKeys(BASE, "ahmed@example.com", instance);
    expect(secret).toBe("s3cr3t_value");
  });

  it("throws on 401", async () => {
    mock.onPost(ENDPOINTS.generateKeys).reply(401);
    await expect(generateKeys(BASE, "ahmed@example.com", instance)).rejects.toThrow();
  });

  it("throws on network error", async () => {
    mock.onPost(ENDPOINTS.generateKeys).networkError();
    await expect(generateKeys(BASE, "ahmed@example.com", instance)).rejects.toThrow();
  });
});

// ─── fetchUser ────────────────────────────────────────────────────────────────

describe("fetchUser", () => {
  let mock: MockAdapter;
  let instance: ReturnType<typeof axios.create>;

  beforeEach(() => {
    ({ instance, mock } = buildMock());
  });
  afterEach(() => mock.restore());

  it("returns api_key and full_name on success", async () => {
    mock
      .onGet(ENDPOINTS.user("ahmed@example.com"))
      .reply(200, { data: { api_key: "key123", full_name: "Ahmed Hassan" } });
    const user = await fetchUser(BASE, "ahmed@example.com", instance);
    expect(user.api_key).toBe("key123");
    expect(user.full_name).toBe("Ahmed Hassan");
  });

  it("throws on 401", async () => {
    mock.onGet(ENDPOINTS.user("ahmed@example.com")).reply(401);
    await expect(fetchUser(BASE, "ahmed@example.com", instance)).rejects.toThrow();
  });

  it("throws on network error", async () => {
    mock.onGet(ENDPOINTS.user("ahmed@example.com")).networkError();
    await expect(fetchUser(BASE, "ahmed@example.com", instance)).rejects.toThrow();
  });
});

// ─── getLoggedUser ────────────────────────────────────────────────────────────

describe("getLoggedUser", () => {
  let mock: MockAdapter;
  let instance: ReturnType<typeof axios.create>;

  beforeEach(() => {
    ({ instance, mock } = buildMock());
  });
  afterEach(() => mock.restore());

  it("returns the logged-in email on 200", async () => {
    mock
      .onGet(ENDPOINTS.getLoggedUser)
      .reply(200, { message: "ahmed@example.com" });
    const email = await getLoggedUser(instance);
    expect(email).toBe("ahmed@example.com");
  });

  it("throws on 401 (session expired)", async () => {
    mock.onGet(ENDPOINTS.getLoggedUser).reply(401);
    await expect(getLoggedUser(instance)).rejects.toThrow();
  });

  it("throws on network error", async () => {
    mock.onGet(ENDPOINTS.getLoggedUser).networkError();
    await expect(getLoggedUser(instance)).rejects.toThrow();
  });
});
