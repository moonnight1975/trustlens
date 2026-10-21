export type ModelProvider =
  | "xai"
  | "openai"
  | "groq"
  | "openrouter"
  | "deepseek"
  | "anthropic"
  | "ollama"
  | "custom";

export interface ModelSettings {
  provider: ModelProvider;
  apiKey: string;
  baseUrl: string;
  primaryModel: string;
  modelLabel: string;
  temperature: number;
  maxTokens?: number;
}

export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  provider: "xai",
  apiKey: "",
  baseUrl: "https://api.x.ai/v1",
  primaryModel: "grok-4.5",
  modelLabel: "Grok 4.5 (Default)",
  temperature: 0.3,
};

export interface ModelPreset {
  id: ModelProvider;
  name: string;
  badge: string;
  defaultBaseUrl: string;
  defaultModel: string;
  suggestedModels: { id: string; label: string }[];
  placeholderKey: string;
  description: string;
  requiresKey: boolean;
}

export const MODEL_PRESETS: Record<ModelProvider, ModelPreset> = {
  xai: {
    id: "xai",
    name: "xAI (Grok)",
    badge: "Default",
    defaultBaseUrl: "https://api.x.ai/v1",
    defaultModel: "grok-4.5",
    suggestedModels: [
      { id: "grok-4.5", label: "Grok 4.5" },
      { id: "grok-4", label: "Grok 4" },
      { id: "grok-beta", label: "Grok Beta" },
    ],
    placeholderKey: "xai-... (or leave blank to use server environment key)",
    description: "Official xAI Grok API. Default provider for TrustLens verification.",
    requiresKey: false,
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    badge: "Popular",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    suggestedModels: [
      { id: "gpt-4o", label: "GPT-4o (Omni)" },
      { id: "gpt-4o-mini", label: "GPT-4o Mini (Fast)" },
      { id: "o1", label: "o1 (Reasoning)" },
      { id: "o1-mini", label: "o1 Mini" },
      { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
    ],
    placeholderKey: "sk-proj-...",
    description: "Use GPT-4o, GPT-4o-mini, or o1 as your primary answering and analysis engine.",
    requiresKey: true,
  },
  groq: {
    id: "groq",
    name: "Groq LPU",
    badge: "Ultra-Fast",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    suggestedModels: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B" },
      { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
      { id: "gemma2-9b-it", label: "Gemma 2 9B" },
    ],
    placeholderKey: "gsk_...",
    description: "Ultra-low latency inference for lightning-fast answer generation and claims extraction.",
    requiresKey: true,
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    badge: "All Models",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "anthropic/claude-3.5-sonnet",
    suggestedModels: [
      { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
      { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
      { id: "google/gemini-2.0-flash-exp:free", label: "Gemini 2.0 Flash" },
      { id: "deepseek/deepseek-chat", label: "DeepSeek V3" },
    ],
    placeholderKey: "sk-or-v1-...",
    description: "Unified API gateway to Claude 3.5, Gemini 2.0, Llama 3.3, and hundreds of models.",
    requiresKey: true,
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    badge: "Reasoning",
    defaultBaseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    suggestedModels: [
      { id: "deepseek-chat", label: "DeepSeek V3 (Chat)" },
      { id: "deepseek-reasoner", label: "DeepSeek R1 (Reasoner)" },
    ],
    placeholderKey: "sk-...",
    description: "DeepSeek official API for V3 and R1 reasoning architectures.",
    requiresKey: true,
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic Claude",
    badge: "Claude Direct",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-sonnet-20241022",
    suggestedModels: [
      { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
      { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
      { id: "claude-3-opus-20240229", label: "Claude 3 Opus" },
    ],
    placeholderKey: "sk-ant-api03-...",
    description: "Direct Anthropic Claude Messages API integration.",
    requiresKey: true,
  },
  ollama: {
    id: "ollama",
    name: "Ollama / Local",
    badge: "Local / Free",
    defaultBaseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3.2",
    suggestedModels: [
      { id: "llama3.2", label: "Llama 3.2" },
      { id: "mistral", label: "Mistral" },
      { id: "qwen2.5", label: "Qwen 2.5" },
      { id: "deepseek-r1", label: "DeepSeek R1" },
    ],
    placeholderKey: "None required for local Ollama",
    description: "Run models locally on your machine with 100% privacy and zero API costs.",
    requiresKey: false,
  },
  custom: {
    id: "custom",
    name: "Custom OpenAI Compatible",
    badge: "Any Endpoint",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    suggestedModels: [],
    placeholderKey: "API Key (if required)...",
    description: "Connect to LM Studio, vLLM, FastChat, Azure OpenAI, or any standard OpenAI compatible endpoint.",
    requiresKey: false,
  },
};
