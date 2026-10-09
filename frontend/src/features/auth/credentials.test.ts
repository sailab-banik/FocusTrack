import { describe, expect, it } from "vitest";
import { parseCredentials } from "./credentials";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("parseCredentials", () => {
  it("accepts a valid email and password, normalizing the email", () => {
    const result = parseCredentials(
      form({ email: "  Me@Example.com ", password: "correct horse" }),
    );
    expect(result).toEqual({
      ok: true,
      credentials: { email: "me@example.com", password: "correct horse" },
    });
  });

  it("rejects missing fields", () => {
    expect(parseCredentials(form({ email: "me@example.com" })).ok).toBe(false);
    expect(parseCredentials(form({ password: "correct horse" })).ok).toBe(
      false,
    );
  });

  it("rejects an invalid email", () => {
    const result = parseCredentials(
      form({ email: "not-an-email", password: "correct horse" }),
    );
    expect(result).toEqual({ ok: false, error: "Enter a valid email address." });
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = parseCredentials(
      form({ email: "me@example.com", password: "short" }),
    );
    expect(result.ok).toBe(false);
  });

  it("does not trim the password", () => {
    const result = parseCredentials(
      form({ email: "me@example.com", password: " pass word " }),
    );
    expect(result).toMatchObject({
      ok: true,
      credentials: { password: " pass word " },
    });
  });
});
