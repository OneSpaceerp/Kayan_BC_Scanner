import { describe, it, expect } from "vitest";
import { isValidPhone, PHONE_REGEX } from "./phone";

describe("isValidPhone", () => {
  it("accepts Egyptian numbers with +20 prefix", () => {
    expect(isValidPhone("+201012345678")).toBe(true);
    expect(isValidPhone("+201112345678")).toBe(true);
    expect(isValidPhone("+201212345678")).toBe(true);
    expect(isValidPhone("+201512345678")).toBe(true);
  });

  it("accepts Egyptian numbers with leading 0", () => {
    expect(isValidPhone("01012345678")).toBe(true);
    expect(isValidPhone("01512345678")).toBe(true);
  });

  it("accepts Saudi numbers with +966 prefix", () => {
    expect(isValidPhone("+966512345678")).toBe(true);
  });

  it("accepts Saudi numbers with leading 0", () => {
    expect(isValidPhone("0512345678")).toBe(true);
  });

  it("accepts E.164 international numbers", () => {
    expect(isValidPhone("+447911123456")).toBe(true);
  });

  it("rejects too-short numbers", () => {
    expect(isValidPhone("123")).toBe(false);
  });

  it("rejects plain letters", () => {
    expect(isValidPhone("notaphone")).toBe(false);
  });
});

describe("PHONE_REGEX", () => {
  it("EG regex captures correct prefixes", () => {
    expect(PHONE_REGEX.eg.test("+201012345678")).toBe(true);
    expect(PHONE_REGEX.eg.test("201012345678")).toBe(true);
    expect(PHONE_REGEX.eg.test("01012345678")).toBe(true);
    // 06 prefix is not Egyptian mobile
    expect(PHONE_REGEX.eg.test("06012345678")).toBe(false);
  });

  it("SA regex captures correct prefixes", () => {
    expect(PHONE_REGEX.sa.test("+966512345678")).toBe(true);
    expect(PHONE_REGEX.sa.test("966512345678")).toBe(true);
    expect(PHONE_REGEX.sa.test("0512345678")).toBe(true);
    // 06 prefix is not Saudi mobile
    expect(PHONE_REGEX.sa.test("0612345678")).toBe(false);
  });
});
