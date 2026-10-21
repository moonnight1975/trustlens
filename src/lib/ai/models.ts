export const PRIMARY_MODEL = "grok-4.5";

export const MULTI_MODELS = [
  { id: "grok-4.5", label: "Grok 4.5" },
  { id: "grok-4", label: "Grok 4" },
] as const;

export type ModelId = (typeof MULTI_MODELS)[number]["id"];
