export type JsonSchema = Record<string, unknown>;

export type JsonRequest = {
  system: string;
  user: string;
  schemaName: string;
  schema: JsonSchema;
};

export type TokenUsage = { inputTokens: number; outputTokens: number };

export type JsonResult = {
  /** The parsed JSON the model produced. Callers must validate it. */
  data: unknown;
  /** Null when the provider did not report it. */
  usage: TokenUsage | null;
};

/** Every AI provider implements this; features never call a vendor API directly. */
export type AiProvider = {
  name: string;
  model: string;
  generateJson(request: JsonRequest): Promise<JsonResult>;
};
