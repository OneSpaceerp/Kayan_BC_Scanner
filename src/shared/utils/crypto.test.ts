import { describe, it, expect, beforeAll, vi } from "vitest";
import {
  generateKey,
  exportKey,
  importKey,
  encryptString,
  decryptString,
  bufToBase64,
  base64ToBuf,
  encryptSession,
  decryptSession,
} from "./crypto";
import type { ERPNextSession } from "@/shared/types/erpnext";

// ─── Stub out the DB for tests that call encryptSession / decryptSession ─────
vi.mock("@/offline/db", () => {
  let stored: { keyData: ArrayBuffer } | undefined;
  return {
    db: {
      cryptoKey: {
        get: vi.fn(async () => stored),
        put: vi.fn(async (row: { id: string; keyData: ArrayBuffer }) => {
          stored = { keyData: row.keyData };
        }),
      },
    },
  };
});

const SAMPLE_SESSION: ERPNextSession = {
  server_url: "https://erp.example.com",
  email: "ahmed@example.com",
  full_name: "Ahmed Hassan",
  api_key: "abc123",
  api_secret: "supersecret",
  created_at: "2026-04-21T00:00:00.000Z",
};

// ─── Base64 helpers ───────────────────────────────────────────────────────────

describe("bufToBase64 / base64ToBuf", () => {
  it("round-trips an ArrayBuffer unchanged", () => {
    const original = new Uint8Array([1, 2, 3, 255, 0, 128]);
    const b64 = bufToBase64(original.buffer);
    const restored = new Uint8Array(base64ToBuf(b64));
    expect(Array.from(restored)).toEqual(Array.from(original));
  });

  it("produces a non-empty base64 string", () => {
    const b64 = bufToBase64(new Uint8Array([72, 101, 108, 108, 111]).buffer);
    expect(typeof b64).toBe("string");
    expect(b64.length).toBeGreaterThan(0);
  });
});

// ─── Key generation & import/export ──────────────────────────────────────────

describe("generateKey / exportKey / importKey", () => {
  it("generates a CryptoKey", async () => {
    const key = await generateKey();
    expect(key).toBeDefined();
    expect(key.algorithm.name).toBe("AES-GCM");
  });

  it("exports a 32-byte raw key", async () => {
    const key = await generateKey();
    const raw = await exportKey(key);
    expect(new Uint8Array(raw).length).toBe(32); // 256 bits
  });

  it("round-trips export → import", async () => {
    const original = await generateKey();
    const raw = await exportKey(original);
    const imported = await importKey(raw);
    expect(imported.algorithm.name).toBe("AES-GCM");
    // Verify they encrypt/decrypt the same data
    const { ciphertext, iv } = await encryptString("test", original);
    const decrypted = await decryptString(ciphertext, iv, imported);
    expect(decrypted).toBe("test");
  });
});

// ─── AES-GCM encrypt / decrypt ───────────────────────────────────────────────

describe("encryptString / decryptString", () => {
  let key: CryptoKey;
  beforeAll(async () => {
    key = await generateKey();
  });

  it("produces a base64 ciphertext and iv", async () => {
    const { ciphertext, iv } = await encryptString("hello world", key);
    expect(typeof ciphertext).toBe("string");
    expect(ciphertext.length).toBeGreaterThan(0);
    expect(typeof iv).toBe("string");
    expect(iv.length).toBeGreaterThan(0);
  });

  it("round-trips plaintext unchanged", async () => {
    const plain = "BC Scanner test payload";
    const { ciphertext, iv } = await encryptString(plain, key);
    const decrypted = await decryptString(ciphertext, iv, key);
    expect(decrypted).toBe(plain);
  });

  it("round-trips JSON string unchanged", async () => {
    const json = JSON.stringify(SAMPLE_SESSION);
    const { ciphertext, iv } = await encryptString(json, key);
    const decrypted = await decryptString(ciphertext, iv, key);
    expect(JSON.parse(decrypted)).toEqual(SAMPLE_SESSION);
  });

  it("produces different ciphertexts for the same input (random IV)", async () => {
    const { ciphertext: c1 } = await encryptString("same", key);
    const { ciphertext: c2 } = await encryptString("same", key);
    expect(c1).not.toBe(c2);
  });

  it("fails to decrypt with a different key", async () => {
    const { ciphertext, iv } = await encryptString("secret", key);
    const wrongKey = await generateKey();
    await expect(decryptString(ciphertext, iv, wrongKey)).rejects.toThrow();
  });

  it("handles Arabic text correctly", async () => {
    const arabic = "أحمد حسن — مدير المبيعات";
    const { ciphertext, iv } = await encryptString(arabic, key);
    const decrypted = await decryptString(ciphertext, iv, key);
    expect(decrypted).toBe(arabic);
  });
});

// ─── Full session encrypt / decrypt (with mocked DB) ─────────────────────────

describe("encryptSession / decryptSession", () => {
  it("round-trips a full ERPNextSession", async () => {
    const row = await encryptSession(SAMPLE_SESSION);
    expect(row.id).toBe("current");
    expect(typeof row.encrypted).toBe("string");
    expect(typeof row.iv).toBe("string");

    const restored = await decryptSession(row);
    expect(restored).toEqual(SAMPLE_SESSION);
  });

  it("does not expose api_secret in the encrypted field as plain text", async () => {
    const row = await encryptSession(SAMPLE_SESSION);
    expect(row.encrypted).not.toContain(SAMPLE_SESSION.api_secret);
  });

  it("reuses the same key across multiple encrypt calls", async () => {
    const row1 = await encryptSession(SAMPLE_SESSION);
    const row2 = await encryptSession({ ...SAMPLE_SESSION, email: "other@example.com" });
    // Both should decrypt successfully (same key in mock store)
    const s1 = await decryptSession(row1);
    const s2 = await decryptSession(row2);
    expect(s1.email).toBe("ahmed@example.com");
    expect(s2.email).toBe("other@example.com");
  });
});
