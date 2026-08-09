"use client";

import { Plug } from "lucide-react";

import { cn } from "@/lib/utils";

export type ProviderId =
  | "anthropic"
  | "openai"
  | "google"
  | "moonshot"
  | "deepseek"
  | "minimax"
  | "mistral"
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
    models: ["mistral-large-latest", "mistral-medium-latest", "codestral-latest"],
    keyHint: "…",
    baseUrl: "https://api.mistral.ai/v1",
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

export function ProviderMark({
  provider,
  className,
}: {
  provider: ProviderId;
  className?: string;
}) {
  const shared = cn("size-4 shrink-0", className);

  if (provider === "anthropic") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={shared} fill="#D97757">
        <path d="M6.9 4h3.5l5.4 16h-3.6l-1.1-3.4H5.9L4.8 20H1.2L6.9 4Zm-.1 9.6h3.7L8.6 8.1 6.8 13.6Z" />
        <path d="M16.3 4h3.6L22.8 20h-3.6L16.3 4Z" opacity=".55" />
      </svg>
    );
  }

  if (provider === "openai") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={cn(shared, "text-foreground")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      >
        <path d="M12 3.2 18.4 7v8L12 18.8 5.6 15V7L12 3.2Z" />
        <path d="M12 3.2v7.6M18.4 7 12 10.8M5.6 7 12 10.8M12 10.8v8" />
      </svg>
    );
  }

  if (provider === "google") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={shared} fill="#4285F4">
        <path d="M12 1.5c0 5.8 4.7 10.5 10.5 10.5C16.7 12 12 16.7 12 22.5 12 16.7 7.3 12 1.5 12 7.3 12 12 7.3 12 1.5Z" />
      </svg>
    );
  }

  if (provider === "moonshot") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={shared} fill="#1F1F1F">
        <circle cx="12" cy="12" r="11" fill="#111827" />
        <path
          d="M15.8 15.6A5.6 5.6 0 0 1 9 8.2a5.6 5.6 0 1 0 6.8 7.4Z"
          fill="#F5F5F5"
        />
      </svg>
    );
  }

  if (provider === "deepseek") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={shared} fill="#4D6BFE">
        <path d="M21 6.5c-2 .6-3 2.2-3.4 3.9-1.5-2.4-4.2-4-7.2-4a8.4 8.4 0 0 0-8.4 8.4c0 .5.4.9.9.9.4 0 .8-.3.9-.7A6.6 6.6 0 0 1 10.4 9c3 0 5.5 2 6.3 4.8.2.9.2 1.4.2 2.2 0 .6.4 1 1 1s1-.4 1-1c0-2.4.6-4.2 2.6-5.2.4-.2.6-.6.5-1l-.4-2.6a.9.9 0 0 0-.6-.7Z" />
        <circle cx="9.6" cy="12.4" r="1.2" fill="#fff" />
      </svg>
    );
  }

  if (provider === "minimax") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={shared}>
        <rect width="24" height="24" rx="6" fill="#E8452C" />
        <path
          d="M6 17V7h2.2l3.8 6.4L15.8 7H18v10h-2.1v-6.3L12.6 16h-1.2L8.1 10.7V17H6Z"
          fill="#fff"
        />
      </svg>
    );
  }

  if (provider === "mistral") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={shared}>
        <rect x="2" y="4" width="20" height="3.2" fill="#FFD800" />
        <rect x="2" y="7.2" width="20" height="3.2" fill="#FFAF00" />
        <rect x="2" y="10.4" width="20" height="3.2" fill="#FF8205" />
        <rect x="2" y="13.6" width="20" height="3.2" fill="#FA500F" />
        <rect x="2" y="16.8" width="20" height="3.2" fill="#E10500" />
        <rect x="6" y="7.2" width="3.5" height="12.8" fill="var(--card)" />
        <rect x="14.5" y="7.2" width="3.5" height="9.6" fill="var(--card)" />
      </svg>
    );
  }

  return <Plug className={cn(shared, "text-muted-foreground")} aria-hidden />;
}
