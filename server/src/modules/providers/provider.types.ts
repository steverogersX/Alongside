export type ToolSpec = {
  name: string;
  description: string;
  schema: Record<string, unknown>;
};

export type ToolCall = {
  id: string;
  name: string;
  input: Record<string, unknown>;
};

export type Turn =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; calls: ToolCall[] }
  | { role: "tool"; callId: string; name: string; result: unknown };

export type Reply = {
  text: string;
  calls: ToolCall[];
};

export type Adapter = {
  send(input: {
    apiKey: string;
    baseUrl: string | null;
    model: string;
    system: string;
    turns: Turn[];
    tools: ToolSpec[];
  }): Promise<Reply>;
};
