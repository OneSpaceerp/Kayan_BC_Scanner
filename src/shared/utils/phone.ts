export const PHONE_REGEX = {
  eg: /^(?:\+?20|0)?1[0125]\d{8}$/,
  sa: /^(?:\+?966|0)?5\d{8}$/,
  e164: /^\+[\d\s\-()]{7,}$/,
} as const;

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.eg.test(value) || PHONE_REGEX.sa.test(value) || PHONE_REGEX.e164.test(value);
}
