import type { Adapter } from "@/modules/providers/provider.types.ts";
import { anthropicAdapter } from "@/modules/providers/anthropic.adapter.ts";
import { googleAdapter } from "@/modules/providers/google.adapter.ts";
import { openaiAdapter } from "@/modules/providers/openai.adapter.ts";

export const PROVIDERS = [
  "anthropic",
  "openai",
  "google",
  "moonshot",
  "deepseek",
  "minimax",
  "mistral",
  "openrouter",
  "other",
] as const;

export type Provider = (typeof PROVIDERS)[number];

const DEFAULT_BASE_URL: Partial<Record<Provider, string>> = {
  moonshot: "https://api.moonshot.ai/v1",
  deepseek: "https://api.deepseek.com/v1",
  minimax: "https://api.minimax.chat/v1",
  mistral: "https://api.mistral.ai/v1",
  openrouter: "https://openrouter.ai/api/v1",
};

// Everything except Anthropic and Gemini speaks the OpenAI wire format, so one
// adapter covers Kimi, DeepSeek, MiniMax, Mistral and anything self-hosted.
export function adapterFor(provider: Provider): Adapter {
  if (provider === "anthropic") return anthropicAdapter;
  if (provider === "google") return googleAdapter;
  return openaiAdapter;
}

export const baseUrlFor = (provider: Provider, stored: string | null) =>
  stored ?? DEFAULT_BASE_URL[provider] ?? null;
