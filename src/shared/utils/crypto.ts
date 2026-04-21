import { db } from "@/offline/db";
import type { ERPNextSession } from "@/shared/types/erpnext";
import type { SessionRow } from "@/offline/db";

const AES_ALGO = "AES-GCM";
const KEY_LENGTH = 256;

// ─── Pure crypto primitives (exported for unit testing) ───────────────────────

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: AES_ALGO, length: KEY_LENGTH }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey("raw", key);
}

export async function importKey(raw: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw, { name: AES_ALGO, length: KEY_LENGTH }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptString(
  plaintext: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const buf = await crypto.subtle.encrypt({ name: AES_ALGO, iv }, key, encoded);
  return {
    ciphertext: bufToBase64(buf),
    iv: bufToBase64(iv.buffer),
  };
}

export async function decryptString(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const buf = await crypto.subtle.decrypt(
    { name: AES_ALGO, iv: base64ToBuf(iv) },
    key,
    base64ToBuf(ciphertext)
  );
  return new TextDecoder().decode(buf);
}

// ─── Base64 helpers ──────────────────────────────────────────────────────────

export function bufToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export function base64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

// ─── Key persistence (IndexedDB) ─────────────────────────────────────────────

async function getMasterKey(): Promise<CryptoKey> {
  const existing = await db.cryptoKey.get("master");
  if (existing) return importKey(existing.keyData);
  const key = await generateKey();
  const raw = await exportKey(key);
  await db.cryptoKey.put({ id: "master", keyData: raw });
  return key;
}

// ─── Session encryption / decryption ─────────────────────────────────────────

export async function encryptSession(session: ERPNextSession): Promise<SessionRow> {
  const key = await getMasterKey();
  const { ciphertext, iv } = await encryptString(JSON.stringify(session), key);
  return { id: "current", encrypted: ciphertext, iv };
}

export async function decryptSession(row: SessionRow): Promise<ERPNextSession> {
  const key = await getMasterKey();
  const json = await decryptString(row.encrypted, row.iv, key);
  return JSON.parse(json) as ERPNextSession;
}
