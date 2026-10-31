import { describe, expect, it } from "vitest";
import { isAuthPage, isPublicPath } from "./routes";

describe("isPublicPath", () => {
  it("allows the auth pages and auth callbacks", () => {
    expect(isPublicPath("/welcome")).toBe(true);
    expect(isPublicPath("/privacy")).toBe(true);
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/signup")).toBe(true);
    expect(isPublicPath("/forgot-password")).toBe(true);
    expect(isPublicPath("/auth/confirm")).toBe(true);
    expect(isPublicPath("/auth/callback")).toBe(true);
  });

  it("protects app pages", () => {
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/log")).toBe(false);
    expect(isPublicPath("/setup")).toBe(false);
    expect(isPublicPath("/setup/ready")).toBe(false);
    expect(isPublicPath("/reset-password")).toBe(false);
    expect(isPublicPath("/login-help")).toBe(false);
    expect(isPublicPath("/authors")).toBe(false);
  });
});

describe("isAuthPage", () => {
  it("matches only the pages for signed-out visitors", () => {
    expect(isAuthPage("/welcome")).toBe(true);
    expect(isAuthPage("/login")).toBe(true);
    expect(isAuthPage("/signup")).toBe(true);
    expect(isAuthPage("/forgot-password")).toBe(true);
    expect(isAuthPage("/reset-password")).toBe(false);
    expect(isAuthPage("/privacy")).toBe(false);
    expect(isAuthPage("/auth/confirm")).toBe(false);
  });
});
