import type { ModelSettings } from "./types";
import { DEFAULT_MODEL_SETTINGS } from "./types";

let currentServerSettings: ModelSettings = { ...DEFAULT_MODEL_SETTINGS };

export function getActiveServerSettings(): ModelSettings {
  return currentServerSettings;
}

export function setActiveServerSettings(settings: Partial<ModelSettings>): ModelSettings {
  currentServerSettings = {
    provider: settings.provider ?? currentServerSettings.provider ?? "xai",
    apiKey: settings.apiKey !== undefined ? settings.apiKey : currentServerSettings.apiKey,
    baseUrl: settings.baseUrl ?? currentServerSettings.baseUrl ?? "https://api.x.ai/v1",
    primaryModel: settings.primaryModel ?? currentServerSettings.primaryModel ?? "grok-4.5",
    modelLabel: settings.modelLabel ?? currentServerSettings.modelLabel ?? "Grok 4.5",
    temperature: typeof settings.temperature === "number" ? settings.temperature : currentServerSettings.temperature,
    maxTokens: settings.maxTokens ?? currentServerSettings.maxTokens,
  };
  return currentServerSettings;
}

export function maskApiKey(key: string): string {
  if (!key) return "";
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "••••••••";
  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`;
}
