import { describe, expect, it } from "vitest";
import { authErrorMessage } from "./auth-errors";

describe("authErrorMessage", () => {
  it("rewrites the errors it knows", () => {
    expect(
      authErrorMessage({
        code: "invalid_credentials",
        message: "Invalid login credentials",
      }),
    ).toBe("That email and password do not match an account.");
  });

  it("gives both rate limits the same advice", () => {
    expect(
      authErrorMessage({ code: "over_request_rate_limit", message: "x" }),
    ).toBe(
      authErrorMessage({ code: "over_email_send_rate_limit", message: "y" }),
    );
  });

  it("falls back to the provider's message", () => {
    expect(
      authErrorMessage({ code: "weak_password", message: "Too common." }),
    ).toBe("Too common.");
    expect(authErrorMessage({ message: "Network down" })).toBe("Network down");
  });
});
