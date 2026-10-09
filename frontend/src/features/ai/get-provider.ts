import { createOpenAiProvider } from "./openai";
import type { AiProvider } from "./provider";

const DEFAULT_OPENAI_MODEL = "gpt-6.1-sol";

/**
 * The configured provider, or null when none is set up. Core flows (timer,
 * logging, history) must never depend on this returning a provider.
 */
export function getAiProvider(): AiProvider | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return createOpenAiProvider(
    apiKey,
    process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
  );
}
