import type { Adapter, Reply, ToolCall } from "@/modules/providers/provider.types.ts";
import { badGateway } from "@/shared/errors.ts";

type Block =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> };

export const anthropicAdapter: Adapter = {
  async send({ apiKey, baseUrl, model, system, turns, tools }) {
    const messages = turns.map((turn) => {
      if (turn.role === "user") {
        return { role: "user", content: [{ type: "text", text: turn.text }] };
      }

      if (turn.role === "assistant") {
        return {
          role: "assistant",
          content: [
            ...(turn.text ? [{ type: "text", text: turn.text }] : []),
            ...turn.calls.map((call) => ({
              type: "tool_use",
              id: call.id,
              name: call.name,
              input: call.input,
            })),
          ],
        };
      }

      return {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: turn.callId,
            content: JSON.stringify(turn.result),
          },
        ],
      };
    });

    const response = await fetch(
      `${baseUrl ?? "https://api.anthropic.com"}/v1/messages`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          system,
          messages,
          tools: tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.schema,
          })),
        }),
      }
    );

    if (!response.ok) {
      throw badGateway(await describe(response));
    }

    const payload = (await response.json()) as { content: Block[] };

    const text = payload.content
      .filter((block): block is Extract<Block, { type: "text" }> =>
        block.type === "text"
      )
      .map((block) => block.text)
      .join("\n")
      .trim();

    const calls: ToolCall[] = payload.content
      .filter((block): block is Extract<Block, { type: "tool_use" }> =>
        block.type === "tool_use"
      )
      .map((block) => ({
        id: block.id,
        name: block.name,
        input: block.input,
      }));

    return { text, calls } satisfies Reply;
  },
};

async function describe(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } | null;

  return body?.error?.message ?? `Provider returned ${response.status}`;
}
