export interface ExtractedFields {
  email?: string;
  website?: string;
  mobile_no?: string;
  phone?: string;
  name?: string;
  company?: string;
  job_title?: string;
}

export function extractFields(rawText: string): ExtractedFields {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const result: ExtractedFields = {};

  // Rule 1: Email
  const emailRegex = /[\w.+-]+@[\w.-]+\.\w{2,}/;
  for (const line of lines) {
    if (!result.email) {
      const match = line.match(emailRegex);
      if (match) result.email = match[0];
    }
  }

  // Rule 2: Website
  const websiteRegex = /(https?:\/\/)?(www\.)?[\w-]+\.[\w.-]+/i;
  for (const line of lines) {
    if (!result.website && !line.match(emailRegex)) {
      const match = line.match(websiteRegex);
      if (match) result.website = match[0];
    }
  }

  // Rule 3,4,5: Phones
  const egMobileRegex = /(?:\+?20|0)?1[0125]\d{8}/;
  const saMobileRegex = /(?:\+?966|0)?5\d{8}/;
  const genericPhoneRegex = /\+?[\d\s\-()]{7,}/;

  for (const line of lines) {
    if (!result.mobile_no && line.match(egMobileRegex)) {
      result.mobile_no = line.match(egMobileRegex)?.[0];
      continue;
    }
    if (!result.mobile_no && line.match(saMobileRegex)) {
      result.mobile_no = line.match(saMobileRegex)?.[0];
      continue;
    }
    if (!result.phone && line.match(genericPhoneRegex)) {
      result.phone = line.match(genericPhoneRegex)?.[0];
    }
  }

  const arabicRegex = /[\u0600-\u06FF]/;
  const arabicLines = lines.filter((l) => arabicRegex.test(l));
  const latinLines = lines.filter((l) => !arabicRegex.test(l));

  // Rule 9: Company
  const companyKeywords = /LLC|Inc|Ltd|Co\.|Group|Holdings|شركة|مؤسسة|مجموعة/i;
  for (const line of lines) {
    if (companyKeywords.test(line)) {
      result.company = line;
      break;
    }
  }

  // Rule 10: Job Title
  const jobKeywords =
    /Manager|Director|Engineer|Founder|CEO|CFO|CTO|Developer|Consultant|مدير|مهندس|مؤسس|مستشار/i;
  for (const line of lines) {
    if (jobKeywords.test(line)) {
      result.job_title = line;
      break;
    }
  }

  // Rule 8: Name
  const isNameLine = (l: string) => {
    const words = l.split(/\s+/);
    if (words.length < 2 || words.length > 4) return false;
    if (/\d/.test(l) || /@/.test(l)) return false;
    // Basic capitalized words check for Latin
    return words.every((w) => /^[A-Z]/.test(w));
  };

  const potentialNames = latinLines
    .filter(isNameLine)
    .sort((a, b) => b.length - a.length);

  if (potentialNames.length > 0) {
    result.name = potentialNames[0];
  } else {
    // Fallback: longest Arabic line without company keyword
    const potentialArabicNames = arabicLines
      .filter((l) => !companyKeywords.test(l))
      .sort((a, b) => b.length - a.length);
    if (potentialArabicNames.length > 0) {
      result.name = potentialArabicNames[0];
    }
  }

  return result;
}
