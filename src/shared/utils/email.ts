const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}
