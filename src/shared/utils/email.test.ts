import { describe, it, expect } from "vitest";
import { isValidEmail } from "./email";

describe("isValidEmail", () => {
  it("accepts standard email addresses", () => {
    expect(isValidEmail("ahmed@example.com")).toBe(true);
    expect(isValidEmail("user.name+tag@domain.co.uk")).toBe(true);
    expect(isValidEmail("user-name@sub.domain.org")).toBe(true);
  });

  it("rejects missing @", () => {
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("missingat.com")).toBe(false);
  });

  it("rejects missing domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects missing TLD", () => {
    expect(isValidEmail("user@domain")).toBe(false);
  });

  it("rejects single-char TLD", () => {
    expect(isValidEmail("user@domain.c")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});
