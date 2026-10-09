import type { AiProvider, JsonRequest } from "./provider";

const RESPONSES_URL = "https://api.openai.com/v1/responses";
const TIMEOUT_MS = 60_000;

type ContentItem =
  | { type: "output_text"; text: string }
  | { type: "refusal"; refusal: string };

type ResponsesBody = {
  status?: string;
  output?: { type: string; content?: ContentItem[] }[];
};

// Plain fetch against the Responses API with Structured Outputs; no SDK.
export function createOpenAiProvider(apiKey: string, model: string): AiProvider {
  return {
    name: "openai",
    model,
    async generateJson(request: JsonRequest): Promise<unknown> {
      const response = await fetch(RESPONSES_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: [
            { role: "system", content: request.system },
            { role: "user", content: request.user },
          ],
          text: {
            format: {
              type: "json_schema",
              name: request.schemaName,
              schema: request.schema,
              strict: true,
            },
          },
          // Session context is personal; do not keep it on OpenAI's side.
          store: false,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(
          `OpenAI request failed (${response.status}): ${await response.text()}`,
        );
      }
      return parseResponsesBody((await response.json()) as ResponsesBody);
    },
  };
}

export function parseResponsesBody(body: ResponsesBody): unknown {
  const content = body.output
    ?.filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? []);
  const refusal = content?.find((item) => item.type === "refusal");
  if (refusal) throw new Error(`OpenAI refused: ${refusal.refusal}`);

  const text = content?.find((item) => item.type === "output_text");
  if (!text) {
    throw new Error(`OpenAI returned no output (status: ${body.status})`);
  }
  return JSON.parse(text.text);
}
