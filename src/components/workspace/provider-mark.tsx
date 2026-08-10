"use client";

import { Plug } from "lucide-react";
import {
  siAnthropic,
  siDeepseek,
  siGooglegemini,
  siKimi,
  siMinimax,
  siMistralai,
  siOpenrouter,
} from "simple-icons";

import { cn } from "@/lib/utils";

export type ProviderId =
  | "anthropic"
  | "openai"
  | "google"
  | "moonshot"
  | "deepseek"
  | "minimax"
  | "mistral"
  | "openrouter"
  | "other";

export const PROVIDERS: {
  id: ProviderId;
  name: string;
  models: string[];
  keyHint: string;
  baseUrl?: string;
  needsBaseUrl?: boolean;
}[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    models: ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5-20251001"],
    keyHint: "sk-ant-…",
  },
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-5", "gpt-5-mini", "o4"],
    keyHint: "sk-…",
  },
  {
    id: "google",
    name: "Gemini",
    models: ["gemini-2.5-pro", "gemini-2.5-flash"],
    keyHint: "AIza…",
  },
  {
    id: "moonshot",
    name: "Kimi",
    models: ["kimi-k2", "moonshot-v1-128k", "moonshot-v1-32k"],
    keyHint: "sk-…",
    baseUrl: "https://api.moonshot.ai/v1",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    models: ["deepseek-chat", "deepseek-reasoner"],
    keyHint: "sk-…",
    baseUrl: "https://api.deepseek.com/v1",
  },
  {
    id: "minimax",
    name: "MiniMax",
    models: ["MiniMax-M2", "abab6.5s-chat"],
    keyHint: "eyJ…",
    baseUrl: "https://api.minimax.chat/v1",
  },
  {
    id: "mistral",
    name: "Mistral",
    models: [
      "mistral-large-latest",
      "mistral-medium-latest",
      "codestral-latest",
    ],
    keyHint: "…",
    baseUrl: "https://api.mistral.ai/v1",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    // A gateway rather than a vendor: the model is namespaced by who made it,
    // and these three are a starting point out of several hundred.
    models: [
      "anthropic/claude-sonnet-5",
      "openai/gpt-5",
      "google/gemini-2.5-pro",
    ],
    keyHint: "sk-or-v1-…",
    baseUrl: "https://openrouter.ai/api/v1",
  },
  {
    id: "other",
    name: "Other",
    models: ["llama-3.3-70b", "qwen-max"],
    keyHint: "Any OpenAI-compatible key",
    needsBaseUrl: true,
  },
];

export const providerOf = (id: ProviderId) =>
  PROVIDERS.find((row) => row.id === id)!;

const BRAND: Partial<
  Record<ProviderId, { path: string; hex: string; title: string }>
> = {
  anthropic: { path: siAnthropic.path, hex: siAnthropic.hex, title: "Anthropic" },
  google: {
    path: siGooglegemini.path,
    hex: siGooglegemini.hex,
    title: "Google Gemini",
  },
  moonshot: { path: siKimi.path, hex: siKimi.hex, title: "Kimi" },
  deepseek: { path: siDeepseek.path, hex: siDeepseek.hex, title: "DeepSeek" },
  minimax: { path: siMinimax.path, hex: siMinimax.hex, title: "MiniMax" },
  mistral: {
    path: siMistralai.path,
    hex: siMistralai.hex,
    title: "Mistral AI",
  },
  openrouter: {
    path: siOpenrouter.path,
    hex: siOpenrouter.hex,
    title: "OpenRouter",
  },
};

// Brands whose black mark disappears on a dark surface follow the text colour
// instead of their hex. OpenRouter's own slate reads as washed out beside the
// saturated marks around it, so it takes the same treatment.
const MONOCHROME = new Set<ProviderId>([
  "anthropic",
  "moonshot",
  "openrouter",
]);

export function ProviderMark({
  provider,
  className,
}: {
  provider: ProviderId;
  className?: string;
}) {
  const shared = cn("size-4 shrink-0", className);
  const brand = BRAND[provider];

  if (brand) {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-label={brand.title}
        className={cn(shared, MONOCHROME.has(provider) && "text-foreground")}
        fill={MONOCHROME.has(provider) ? "currentColor" : `#${brand.hex}`}
      >
        <path d={brand.path} />
      </svg>
    );
  }

  if (provider === "openai") {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-label="OpenAI"
        className={cn(shared, "text-foreground")}
        fill="currentColor"
      >
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zM8.307 12.863l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    );
  }

  return <Plug className={cn(shared, "text-muted-foreground")} aria-hidden />;
}
