import type { Adapter, Reply, ToolCall } from "@/modules/providers/provider.types.ts";
import { badGateway } from "@/shared/errors.ts";

type Choice = {
  message: {
    content: string | null;
    tool_calls?: {
      id: string;
      function: { name: string; arguments: string };
    }[];
  };
};

/** Covers OpenAI itself plus every OpenAI-compatible endpoint. */
export const openaiAdapter: Adapter = {
  async send({ apiKey, baseUrl, model, system, turns, tools }) {
    const messages: Record<string, unknown>[] = [
      { role: "system", content: system },
    ];

    for (const turn of turns) {
      if (turn.role === "user") {
        messages.push({ role: "user", content: turn.text });
        continue;
      }

      if (turn.role === "assistant") {
        messages.push({
          role: "assistant",
          content: turn.text || null,
          ...(turn.calls.length > 0
            ? {
                tool_calls: turn.calls.map((call) => ({
                  id: call.id,
                  type: "function",
                  function: {
                    name: call.name,
                    arguments: JSON.stringify(call.input),
                  },
                })),
              }
            : {}),
        });
        continue;
      }

      messages.push({
        role: "tool",
        tool_call_id: turn.callId,
        content: JSON.stringify(turn.result),
      });
    }

    const response = await fetch(
      `${baseUrl ?? "https://api.openai.com/v1"}/chat/completions`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          tools: tools.map((tool) => ({
            type: "function",
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.schema,
            },
          })),
        }),
      }
    );

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      throw badGateway(
        body?.error?.message ?? `Provider returned ${response.status}`
      );
    }

    const payload = (await response.json()) as { choices: Choice[] };
    const message = payload.choices[0]?.message;

    const calls: ToolCall[] = (message?.tool_calls ?? []).map((call) => ({
      id: call.id,
      name: call.function.name,
      input: safeParse(call.function.arguments),
    }));

    return { text: (message?.content ?? "").trim(), calls } satisfies Reply;
  },
};

function safeParse(value: string): Record<string, unknown> {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}
