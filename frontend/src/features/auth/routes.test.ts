import { describe, expect, it } from "vitest";
import { isAuthPage, isPublicPath } from "./routes";

describe("isPublicPath", () => {
  it("allows the auth pages and auth callbacks", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/signup")).toBe(true);
    expect(isPublicPath("/auth/confirm")).toBe(true);
  });

  it("protects app pages", () => {
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/sessions")).toBe(false);
    expect(isPublicPath("/login-help")).toBe(false);
    expect(isPublicPath("/authors")).toBe(false);
  });
});

describe("isAuthPage", () => {
  it("matches only the sign-in and sign-up pages", () => {
    expect(isAuthPage("/login")).toBe(true);
    expect(isAuthPage("/signup")).toBe(true);
    expect(isAuthPage("/auth/confirm")).toBe(false);
  });
});
