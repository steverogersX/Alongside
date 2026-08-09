import type { Adapter, Reply, ToolCall } from "@/modules/providers/provider.types.ts";
import { badGateway } from "@/shared/errors.ts";

type Part =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, unknown> } };

export const googleAdapter: Adapter = {
  async send({ apiKey, baseUrl, model, system, turns, tools }) {
    const contents = turns.map((turn) => {
      if (turn.role === "user") {
        return { role: "user", parts: [{ text: turn.text }] };
      }

      if (turn.role === "assistant") {
        return {
          role: "model",
          parts: [
            ...(turn.text ? [{ text: turn.text }] : []),
            ...turn.calls.map((call) => ({
              functionCall: { name: call.name, args: call.input },
            })),
          ],
        };
      }

      return {
        role: "user",
        parts: [
          {
            functionResponse: {
              name: turn.name,
              response: { result: turn.result },
            },
          },
        ],
      };
    });

    const origin = baseUrl ?? "https://generativelanguage.googleapis.com/v1beta";

    const response = await fetch(
      `${origin}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          tools: [
            {
              functionDeclarations: tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                parameters: tool.schema,
              })),
            },
          ],
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

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: Part[] } }[];
    };

    const parts = payload.candidates?.[0]?.content?.parts ?? [];

    const text = parts
      .filter((part): part is { text: string } => "text" in part)
      .map((part) => part.text)
      .join("\n")
      .trim();

    const calls: ToolCall[] = parts
      .filter(
        (part): part is Extract<Part, { functionCall: unknown }> =>
          "functionCall" in part
      )
      .map((part, index) => ({
        id: `${part.functionCall.name}_${index}`,
        name: part.functionCall.name,
        input: part.functionCall.args,
      }));

    return { text, calls } satisfies Reply;
  },
};
