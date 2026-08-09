import type { Request, Response } from "express";
import { z } from "zod";

import { identify } from "@/modules/mcp/mcp.auth.ts";
import { ToolError, tools } from "@/modules/mcp/mcp.tools.ts";

const PROTOCOL = "2025-06-18";

const rpc = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number()]).optional(),
  method: z.string(),
  params: z.record(z.string(), z.unknown()).optional(),
});

const result = (id: unknown, value: unknown) => ({
  jsonrpc: "2.0" as const,
  id,
  result: value,
});

const failure = (id: unknown, code: number, message: string) => ({
  jsonrpc: "2.0" as const,
  id,
  error: { code, message },
});

const content = (value: unknown, isError = false) => ({
  content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
  isError,
});

export async function mcpController(req: Request, res: Response) {
  const parsed = rpc.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(failure(null, -32600, "Invalid request"));
    return;
  }

  const { id, method, params } = parsed.data;

  if (method === "initialize") {
    res.json(
      result(id, {
        protocolVersion: PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "alongside", version: "1.0.0" },
      })
    );
    return;
  }

  if (method.startsWith("notifications/")) {
    res.status(202).end();
    return;
  }

  const identity = await identify(req);
  if (!identity) {
    res
      .status(401)
      .set("WWW-Authenticate", 'Bearer realm="alongside"')
      .json(failure(id, -32001, "Connect Alongside first — token missing or revoked"));
    return;
  }

  if (method === "tools/list") {
    res.json(
      result(id, {
        tools: tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: z.toJSONSchema(tool.schema),
        })),
      })
    );
    return;
  }

  if (method === "tools/call") {
    const name = params?.name;
    const tool = tools.find((candidate) => candidate.name === name);

    if (!tool) {
      res.json(failure(id, -32602, `Unknown tool: ${String(name)}`));
      return;
    }

    const input = tool.schema.safeParse(params?.arguments ?? {});
    if (!input.success) {
      res.json(
        result(
          id,
          content(
            { error: "invalid_input", message: input.error.issues[0]?.message },
            true
          )
        )
      );
      return;
    }

    try {
      const value = await tool.run(
        identity,
        input.data as never
      );
      res.json(result(id, content(value)));
    } catch (error) {
      if (error instanceof ToolError) {
        res.json(
          result(id, content({ error: error.code, message: error.message }, true))
        );
        return;
      }

      throw error;
    }

    return;
  }

  res.json(failure(id, -32601, `Unknown method: ${method}`));
}
