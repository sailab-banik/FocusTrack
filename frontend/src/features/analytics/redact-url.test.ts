import { describe, expect, it } from "vitest";
import { redactUrl } from "./redact-url";

const ORIGIN = "https://focustrack.example";

describe("redactUrl", () => {
  it("hides a session id but keeps the other log pages", () => {
    expect(
      redactUrl(`${ORIGIN}/log/3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b`),
    ).toBe(`${ORIGIN}/log/session`);
    expect(redactUrl(`${ORIGIN}/log/new`)).toBe(`${ORIGIN}/log/new`);
  });

  it("keeps campaign parameters and drops everything else", () => {
    expect(
      redactUrl(`${ORIGIN}/welcome?utm_source=hn&code=secret&error=link#top`),
    ).toBe(`${ORIGIN}/welcome?utm_source=hn`);
  });
});
