export type JsonSchema = Record<string, unknown>;

export type JsonRequest = {
  system: string;
  user: string;
  schemaName: string;
  schema: JsonSchema;
};

/** Every AI provider implements this; features never call a vendor API directly. */
export type AiProvider = {
  name: string;
  model: string;
  /** Returns the parsed JSON the model produced. Callers must validate it. */
  generateJson(request: JsonRequest): Promise<unknown>;
};
