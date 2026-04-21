import type { BusinessCardData } from "@/shared/types/businessCard";

// ─── Payload type detection ───────────────────────────────────────────────────

type QrPayloadType = "vcard" | "mecard" | "url" | "text";

function detectType(raw: string): QrPayloadType {
  const t = raw.trimStart().toUpperCase();
  if (t.startsWith("BEGIN:VCARD")) return "vcard";
  if (t.startsWith("MECARD:")) return "mecard";
  if (/^https?:\/\//i.test(raw.trim())) return "url";
  return "text";
}

// ─── vCard parser ─────────────────────────────────────────────────────────────

function unfoldVCard(raw: string): string {
  // RFC 6350 §3.2 — a CRLF followed by a single SP or HTAB is a line fold
  return raw.replace(/\r?\n[ \t]/g, "");
}

function vCardProp(lines: string[], name: string): string | null {
  // Match PROPERTY or GROUP.PROPERTY, with optional params, case-insensitive
  const re = new RegExp(`^(?:[^.]+\\.)?${name}(?:;[^:]*)?:(.*)`, "i");
  for (const line of lines) {
    const m = re.exec(line);
    if (m) return m[1].trim();
  }
  return null;
}

function vCardAllProps(lines: string[], name: string): string[] {
  const re = new RegExp(`^(?:[^.]+\\.)?${name}((?:;[^:]*))?:(.*)`, "i");
  const results: string[] = [];
  for (const line of lines) {
    const m = re.exec(line);
    if (m) results.push(m[2].trim());
  }
  return results;
}

function parseVCard(raw: string): BusinessCardData {
  const unfolded = unfoldVCard(raw);
  const lines = unfolded.split(/\r?\n/);

  // FN takes precedence over N
  const fn = vCardProp(lines, "FN");
  let lead_name = fn ?? undefined;

  if (!lead_name) {
    const n = vCardProp(lines, "N");
    if (n) {
      // N:LastName;FirstName;Additional;Prefix;Suffix
      const parts = n.split(";");
      const last = parts[0]?.trim();
      const first = parts[1]?.trim();
      lead_name = [first, last].filter(Boolean).join(" ") || undefined;
    }
  }

  // ORG — take first component (before ';')
  const orgRaw = vCardProp(lines, "ORG");
  const company_name = orgRaw?.split(";")[0].trim() || undefined;

  const job_title = vCardProp(lines, "TITLE") ?? undefined;

  // EMAIL — first found
  const emails = vCardAllProps(lines, "EMAIL");
  const email_id = emails[0] ?? undefined;

  // TEL — split into mobile and landline by TYPE param
  let mobile_no: string | undefined;
  let phone: string | undefined;
  const telRe = /^(?:[^.]+\.)?TEL((?:;[^:]*))?:(.*)/i;
  for (const line of lines) {
    const m = telRe.exec(line);
    if (!m) continue;
    const params = (m[1] ?? "").toUpperCase();
    const number = m[2].trim();
    if (!number) continue;
    const isMobile = params.includes("CELL") || params.includes("MOBILE");
    if (isMobile && !mobile_no) { mobile_no = number; }
    else if (!mobile_no && !phone) { mobile_no = number; } // first TEL regardless
    else if (!phone) { phone = number; }
  }

  const url = vCardProp(lines, "URL");
  const website = url ?? undefined;

  return { lead_name, company_name, job_title, email_id, mobile_no, phone, website, captureMethod: "QR" };
}

// ─── MeCard parser ────────────────────────────────────────────────────────────

function parseMeCard(raw: string): BusinessCardData {
  // MECARD:N:LastName,FirstName;ORG:...;TEL:...;EMAIL:...;URL:...;;
  const body = raw.replace(/^MECARD:/i, "").replace(/;;$/, "");
  const fields: Record<string, string> = {};

  // Split on ';' but not escaped '\;'
  // Simple approach: split naively — most real MeCard don't escape
  const parts = body.split(";");
  for (const part of parts) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) continue;
    const key = part.slice(0, colonIdx).trim().toUpperCase();
    const val = part.slice(colonIdx + 1).trim();
    if (key && val) fields[key] = fields[key] ?? val; // first wins
  }

  // N: "LastName,FirstName" → "FirstName LastName"
  let lead_name: string | undefined;
  if (fields["N"]) {
    const nParts = fields["N"].split(",");
    if (nParts.length >= 2) {
      lead_name = [nParts[1].trim(), nParts[0].trim()].filter(Boolean).join(" ");
    } else {
      lead_name = fields["N"].trim() || undefined;
    }
  }

  return {
    lead_name: lead_name || undefined,
    company_name: fields["ORG"] || undefined,
    email_id: fields["EMAIL"] || undefined,
    mobile_no: fields["TEL"] || fields["PHONE"] || undefined,
    website: fields["URL"] || undefined,
    captureMethod: "QR",
  };
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function parseQrCode(raw: string): BusinessCardData {
  const type = detectType(raw);

  switch (type) {
    case "vcard":
      return parseVCard(raw);

    case "mecard":
      return parseMeCard(raw);

    case "url":
      return { website: raw.trim(), captureMethod: "QR" };

    case "text":
    default:
      return { notes: raw.trim(), captureMethod: "QR" };
  }
}

export { detectType };
