import type { AnalysisRecord, FeedbackRecord } from "@/lib/types";
import type { ModelSettings } from "@/lib/ai/types";
import { DEFAULT_MODEL_SETTINGS } from "@/lib/ai/types";

export const STORE_KEY = "trustlens.v1";
export const CHAT_KEY = "trustlens.chat.v1";
export const SETTINGS_KEY = "trustlens.settings.v1";
const MAX_ANALYSES = 40;
const MAX_FEEDBACK = 200;
const MAX_TURNS = 40;

export type WellbeingSettings = {
  breakReminders: boolean;
  verificationReminders: boolean;
  breakMinutes: number;
};

export type StoreData = {
  version: 1;
  analyses: AnalysisRecord[];
  feedback: FeedbackRecord[];
  wellbeing: WellbeingSettings;
  lastId: string | null;
};

export type ChatSource = { title: string; snippet: string; url: string; domain: string };
export type ChatTurn = { role: "user" | "assistant"; text: string; at: string; sources?: ChatSource[] };

export function emptyStore(): StoreData {
  return {
    version: 1,
    analyses: [],
    feedback: [],
    wellbeing: { breakReminders: false, verificationReminders: true, breakMinutes: 30 },
    lastId: null,
  };
}

function isAnalysis(value: unknown): value is AnalysisRecord {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<AnalysisRecord>;
  return (
    typeof row.id === "string" &&
    typeof row.question === "string" &&
    typeof row.answer === "string" &&
    typeof row.scores?.trustScore === "number" &&
    Array.isArray(row.claims) &&
    Array.isArray(row.evidence)
  );
}

export function migrateStore(raw: unknown): StoreData {
  const empty = emptyStore();
  if (Array.isArray(raw)) {
    return { ...empty, analyses: raw.filter(isAnalysis).slice(0, MAX_ANALYSES) };
  }
  if (!raw || typeof raw !== "object") return empty;
  const row = raw as Partial<StoreData>;
  const analyses = Array.isArray(row.analyses) ? row.analyses.filter(isAnalysis).slice(0, MAX_ANALYSES) : [];
  const feedback = Array.isArray(row.feedback)
    ? row.feedback
        .filter((item): item is FeedbackRecord => {
          if (!item || typeof item !== "object") return false;
          const f = item as FeedbackRecord;
          return typeof f.id === "string" && typeof f.kind === "string" && f.status === "saved";
        })
        .slice(0, MAX_FEEDBACK)
    : [];
  const wellbeing = {
    ...empty.wellbeing,
    ...(row.wellbeing && typeof row.wellbeing === "object" ? row.wellbeing : {}),
  };
  return {
    version: 1,
    analyses,
    feedback,
    wellbeing: {
      breakReminders: Boolean(wellbeing.breakReminders),
      verificationReminders: wellbeing.verificationReminders !== false,
      breakMinutes: Number.isFinite(wellbeing.breakMinutes) ? Math.min(120, Math.max(10, wellbeing.breakMinutes)) : 30,
    },
    lastId: typeof row.lastId === "string" ? row.lastId : (analyses[0]?.id ?? null),
  };
}

function read(): StoreData {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    return migrateStore(JSON.parse(raw));
  } catch {
    return emptyStore();
  }
}

function write(store: StoreData) {
  if (typeof window === "undefined") throw new Error("Storage is only available in the browser.");
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function listAnalyses() {
  return read().analyses;
}

export function getAnalysis(id: string) {
  return read().analyses.find((item) => item.id === id) ?? null;
}

export function getLastAnalysis() {
  const store = read();
  if (store.lastId) return store.analyses.find((item) => item.id === store.lastId) ?? store.analyses[0] ?? null;
  return store.analyses[0] ?? null;
}

export function saveAnalysis(record: AnalysisRecord) {
  const store = read();
  const without = store.analyses.filter((item) => item.id !== record.id);
  store.analyses = [record, ...without].slice(0, MAX_ANALYSES);
  store.lastId = record.id;
  if (record.improvement?.ofId) {
    store.analyses = store.analyses.map((item) =>
      item.id === record.improvement?.ofId ? { ...item, improvedChildId: record.id } : item,
    );
  }
  write(store);
  return record;
}

export function deleteAnalysis(id: string) {
  const store = read();
  store.analyses = store.analyses.filter((item) => item.id !== id);
  if (store.lastId === id) store.lastId = store.analyses[0]?.id ?? null;
  write(store);
}

export function saveFeedback(input: Omit<FeedbackRecord, "id" | "createdAt" | "status">) {
  const store = read();
  const record: FeedbackRecord = {
    ...input,
    note: input.note.slice(0, 500),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "saved",
  };
  store.feedback = [record, ...store.feedback].slice(0, MAX_FEEDBACK);
  write(store);
  return record;
}

export function listFeedback() {
  return read().feedback;
}

export function updateWellbeing(patch: Partial<WellbeingSettings>) {
  const store = read();
  store.wellbeing = { ...store.wellbeing, ...patch };
  write(store);
  return store.wellbeing;
}

export function getWellbeing() {
  return read().wellbeing;
}

export function syncSettingsCookie(settings: ModelSettings) {
  if (typeof document === "undefined") return;
  try {
    const value = encodeURIComponent(JSON.stringify(settings));
    document.cookie = `trustlens_model_settings=${value}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function getApiSettings(): ModelSettings {
  if (typeof window === "undefined") return { ...DEFAULT_MODEL_SETTINGS };
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_MODEL_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<ModelSettings>;
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_MODEL_SETTINGS };
    return {
      provider: parsed.provider || DEFAULT_MODEL_SETTINGS.provider,
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      baseUrl: parsed.baseUrl || DEFAULT_MODEL_SETTINGS.baseUrl,
      primaryModel: parsed.primaryModel || DEFAULT_MODEL_SETTINGS.primaryModel,
      modelLabel: parsed.modelLabel || DEFAULT_MODEL_SETTINGS.modelLabel,
      temperature: typeof parsed.temperature === "number" ? parsed.temperature : DEFAULT_MODEL_SETTINGS.temperature,
      maxTokens: parsed.maxTokens,
    };
  } catch {
    return { ...DEFAULT_MODEL_SETTINGS };
  }
}

export function saveApiSettings(settings: ModelSettings): ModelSettings {
  if (typeof window === "undefined") return settings;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    syncSettingsCookie(settings);
  } catch {
    // ignore
  }
  return settings;
}

export function resetApiSettings(): ModelSettings {
  if (typeof window === "undefined") return { ...DEFAULT_MODEL_SETTINGS };
  try {
    window.localStorage.removeItem(SETTINGS_KEY);
    syncSettingsCookie(DEFAULT_MODEL_SETTINGS);
  } catch {
    // ignore
  }
  return { ...DEFAULT_MODEL_SETTINGS };
}

export function readChat(): ChatTurn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(CHAT_KEY) || "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item): item is ChatTurn => {
        if (!item || typeof item !== "object") return false;
        const turn = item as ChatTurn;
        return (turn.role === "user" || turn.role === "assistant") && typeof turn.text === "string";
      })
      .slice(-MAX_TURNS);
  } catch {
    return [];
  }
}

export function writeChat(turns: ChatTurn[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAT_KEY, JSON.stringify(turns.slice(-MAX_TURNS)));
}

export function buildEvaluationDataset() {
  const store = read();
  return {
    schema: "trustlens-eval-v1",
    exportedAt: new Date().toISOString(),
    note: "User feedback is not ground truth and is not used to train a model. This file is a later evaluation dataset only.",
    feedback: store.feedback,
    analyses: store.analyses.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      question: item.question,
      trustScore: item.scores.trustScore,
      riskLevel: item.scores.riskLevel,
      formulaVersion: item.scores.formulaVersion,
      evidenceMode: item.evidenceMode,
      claimStatuses: item.claims.map((claim) => ({ id: claim.id, status: claim.status, text: claim.text })),
      improvementOf: item.improvement?.ofId ?? null,
    })),
  };
}
