import { describe, it, expect } from "vitest";
import { parseQrCode, detectType } from "./qrParser";

// ─── detectType ───────────────────────────────────────────────────────────────

describe("detectType", () => {
  it("detects vcard", () => {
    expect(detectType("BEGIN:VCARD\nEND:VCARD")).toBe("vcard");
  });

  it("detects vcard case-insensitive with leading whitespace", () => {
    expect(detectType("  begin:vcard\nEND:VCARD")).toBe("vcard");
  });

  it("detects mecard", () => {
    expect(detectType("MECARD:N:Smith,John;;")).toBe("mecard");
  });

  it("detects mecard case-insensitive", () => {
    expect(detectType("mecard:N:Smith,John;;")).toBe("mecard");
  });

  it("detects http url", () => {
    expect(detectType("http://example.com")).toBe("url");
  });

  it("detects https url", () => {
    expect(detectType("https://example.com")).toBe("url");
  });

  it("falls back to text", () => {
    expect(detectType("Just some text")).toBe("text");
  });
});

// ─── vCard ────────────────────────────────────────────────────────────────────

const VCARD_FULL = `BEGIN:VCARD
VERSION:3.0
FN:John Smith
N:Smith;John;;;
ORG:Acme Corp;Engineering
TITLE:Software Engineer
EMAIL;TYPE=WORK:john@acme.com
TEL;TYPE=CELL:+1-555-000-1234
TEL;TYPE=WORK:+1-555-000-5678
URL:https://acme.com
END:VCARD`;

describe("parseQrCode — vCard", () => {
  it("parses full vcard", () => {
    const result = parseQrCode(VCARD_FULL);
    expect(result.lead_name).toBe("John Smith");
    expect(result.company_name).toBe("Acme Corp");
    expect(result.job_title).toBe("Software Engineer");
    expect(result.email_id).toBe("john@acme.com");
    expect(result.mobile_no).toBe("+1-555-000-1234");
    expect(result.phone).toBe("+1-555-000-5678");
    expect(result.website).toBe("https://acme.com");
    expect(result.captureMethod).toBe("QR");
  });

  it("falls back to N when FN is absent", () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:Smith;John;;;\nEND:VCARD`;
    const result = parseQrCode(vcard);
    expect(result.lead_name).toBe("John Smith");
  });

  it("uses first ORG component only", () => {
    const vcard = `BEGIN:VCARD\nFN:X\nORG:Top Level;Division\nEND:VCARD`;
    expect(parseQrCode(vcard).company_name).toBe("Top Level");
  });

  it("assigns first TEL to mobile_no when no TYPE param", () => {
    const vcard = `BEGIN:VCARD\nFN:X\nTEL:+1-555-111-2222\nEND:VCARD`;
    const result = parseQrCode(vcard);
    expect(result.mobile_no).toBe("+1-555-111-2222");
    expect(result.phone).toBeUndefined();
  });

  it("assigns MOBILE type to mobile_no", () => {
    const vcard = `BEGIN:VCARD\nFN:X\nTEL;TYPE=MOBILE:+1-555-999-0000\nEND:VCARD`;
    expect(parseQrCode(vcard).mobile_no).toBe("+1-555-999-0000");
  });

  it("assigns second TEL to phone", () => {
    const vcard = `BEGIN:VCARD\nFN:X\nTEL:+1-555-111\nTEL:+1-555-222\nEND:VCARD`;
    const result = parseQrCode(vcard);
    expect(result.mobile_no).toBe("+1-555-111");
    expect(result.phone).toBe("+1-555-222");
  });

  it("handles RFC 6350 line folding", () => {
    // "\n " is the fold marker (consumed); the remaining " Smith" is appended
    const vcard = `BEGIN:VCARD\nFN:John\n  Smith\nEND:VCARD`;
    expect(parseQrCode(vcard).lead_name).toBe("John Smith");
  });

  it("handles CRLF line endings", () => {
    const vcard = "BEGIN:VCARD\r\nFN:Jane Doe\r\nEND:VCARD";
    expect(parseQrCode(vcard).lead_name).toBe("Jane Doe");
  });

  it("handles group prefix on property (e.g. item1.EMAIL)", () => {
    const vcard = `BEGIN:VCARD\nFN:X\nitem1.EMAIL:grouped@example.com\nEND:VCARD`;
    expect(parseQrCode(vcard).email_id).toBe("grouped@example.com");
  });

  it("returns undefined fields when vcard is minimal", () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nEND:VCARD`;
    const result = parseQrCode(vcard);
    expect(result.lead_name).toBeUndefined();
    expect(result.company_name).toBeUndefined();
    expect(result.captureMethod).toBe("QR");
  });

  it("uses PRD sample vCard", () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Ahmed Al-Rashid
N:Al-Rashid;Ahmed;;;
ORG:Kayan Trading LLC
TITLE:Chief Executive Officer
TEL;TYPE=CELL:+966501234567
EMAIL;TYPE=WORK:ahmed@kayan.sa
URL:https://kayan.sa
END:VCARD`;
    const result = parseQrCode(vcard);
    expect(result.lead_name).toBe("Ahmed Al-Rashid");
    expect(result.company_name).toBe("Kayan Trading LLC");
    expect(result.job_title).toBe("Chief Executive Officer");
    expect(result.mobile_no).toBe("+966501234567");
    expect(result.email_id).toBe("ahmed@kayan.sa");
    expect(result.website).toBe("https://kayan.sa");
  });
});

// ─── MeCard ───────────────────────────────────────────────────────────────────

describe("parseQrCode — MeCard", () => {
  it("parses a full MeCard", () => {
    const raw = "MECARD:N:Smith,John;ORG:Acme;TEL:+1-555-123;EMAIL:john@acme.com;URL:https://acme.com;;";
    const result = parseQrCode(raw);
    expect(result.lead_name).toBe("John Smith");
    expect(result.company_name).toBe("Acme");
    expect(result.mobile_no).toBe("+1-555-123");
    expect(result.email_id).toBe("john@acme.com");
    expect(result.website).toBe("https://acme.com");
    expect(result.captureMethod).toBe("QR");
  });

  it("handles single-part N field", () => {
    const raw = "MECARD:N:Mononym;;";
    expect(parseQrCode(raw).lead_name).toBe("Mononym");
  });

  it("returns undefined fields when MeCard is minimal", () => {
    const raw = "MECARD:N:Doe,Jane;;";
    const result = parseQrCode(raw);
    expect(result.lead_name).toBe("Jane Doe");
    expect(result.company_name).toBeUndefined();
    expect(result.email_id).toBeUndefined();
  });
});

// ─── URL ──────────────────────────────────────────────────────────────────────

describe("parseQrCode — URL", () => {
  it("maps https URL to website field", () => {
    const result = parseQrCode("https://example.com");
    expect(result.website).toBe("https://example.com");
    expect(result.captureMethod).toBe("QR");
    expect(result.lead_name).toBeUndefined();
  });

  it("maps http URL to website field", () => {
    expect(parseQrCode("http://example.com").website).toBe("http://example.com");
  });

  it("trims surrounding whitespace from URL", () => {
    expect(parseQrCode("  https://example.com  ").website).toBe("https://example.com");
  });
});

// ─── Plain text ───────────────────────────────────────────────────────────────

describe("parseQrCode — plain text", () => {
  it("maps plain text to notes field", () => {
    const result = parseQrCode("Call me at 555-1234");
    expect(result.notes).toBe("Call me at 555-1234");
    expect(result.captureMethod).toBe("QR");
    expect(result.website).toBeUndefined();
  });

  it("trims surrounding whitespace from text", () => {
    expect(parseQrCode("  hello  ").notes).toBe("hello");
  });
});
