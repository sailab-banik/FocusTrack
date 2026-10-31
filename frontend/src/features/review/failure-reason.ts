/**
 * A short category for why a write failed. Provider messages are never stored:
 * they can quote the prompt, and so session content.
 */
export function failureReason(error: unknown): string {
  if (error instanceof SyntaxError) return "Response failed schema check";
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return "Provider timeout";
  }
  const message = error instanceof Error ? error.message : "";
  // parseReport's validation errors all start this way.
  if (message.startsWith("Report ")) return "Response failed schema check";
  if (message.includes("(429)")) return "Rate limited by provider";
  if (message.includes("refused")) return "Provider refused";
  if (message.startsWith("OpenAI")) return "Provider error";
  return "Unexpected error";
}
