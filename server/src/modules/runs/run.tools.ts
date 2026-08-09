import type { AgentRun, User } from "@/db/types.ts";
import { chatRepository } from "@/modules/chat/chat.repository.ts";
import { collabDocument } from "@/modules/collab/collab.document.ts";
import { documentRepository } from "@/modules/documents/document.repository.ts";
import type { ToolSpec } from "@/modules/providers/provider.types.ts";
import { atLeast } from "@/shared/role.ts";

const READ_TOOLS: ToolSpec[] = [
  {
    name: "read_document",
    description:
      "Read the document as numbered blocks. Every block has an index, a type (p, h1..h6, blockquote, list) and its text. Use the indices to act on positions such as 'the second paragraph' or 'the last block'.",
    schema: { type: "object", properties: {}, required: [] },
  },
];

const EXPECT = {
  type: "string",
  description:
    "The first ~40 characters of the block you believe you are changing, copied from read_document. The edit is refused if it no longer matches.",
};

const WRITE_TOOLS: ToolSpec[] = [
  {
    name: "replace_block",
    description:
      "Replace the whole text of one block, keeping its type. Use for 'rewrite the second paragraph'.",
    schema: {
      type: "object",
      properties: {
        index: { type: "integer" },
        text: { type: "string" },
        expect: EXPECT,
      },
      required: ["index", "text", "expect"],
    },
  },
  {
    name: "delete_block",
    description:
      "Delete one block entirely. Use for 'remove the second paragraph'.",
    schema: {
      type: "object",
      properties: { index: { type: "integer" }, expect: EXPECT },
      required: ["index", "expect"],
    },
  },
  {
    name: "insert_block",
    description:
      "Insert a new block after the given index. Use -1 for the very top, or the last index for the bottom.",
    schema: {
      type: "object",
      properties: {
        after: { type: "integer" },
        text: { type: "string" },
        type: {
          type: "string",
          description: "p, h1, h2, h3 or blockquote. Defaults to p.",
        },
      },
      required: ["after", "text"],
    },
  },
  {
    name: "replace_text",
    description:
      "Replace an exact snippet of the document. The snippet must appear exactly once — include surrounding words to make it unique.",
    schema: {
      type: "object",
      properties: {
        find: { type: "string", description: "Exact text to replace" },
        replace: { type: "string", description: "New text" },
      },
      required: ["find", "replace"],
    },
  },
  {
    name: "insert_after",
    description:
      "Append text to the end of the paragraph containing an exact anchor.",
    schema: {
      type: "object",
      properties: {
        anchor: { type: "string" },
        text: { type: "string" },
      },
      required: ["anchor", "text"],
    },
  },
];

const FINISH_TOOL: ToolSpec = {
  name: "finish",
  description:
    "Call this when the task is done. Say what you changed in one or two sentences, addressed to the person who asked.",
  schema: {
    type: "object",
    properties: { summary: { type: "string" } },
    required: ["summary"],
  },
};

export function toolsFor(run: AgentRun): ToolSpec[] {
  return atLeast(run.ceiling, "editor")
    ? [...READ_TOOLS, ...WRITE_TOOLS, FINISH_TOOL]
    : [...READ_TOOLS, FINISH_TOOL];
}

export async function runTool(
  run: AgentRun,
  agent: User,
  name: string,
  input: Record<string, unknown>
): Promise<unknown> {
  if (name === "read_document") {
    const document = await documentRepository.findById(run.documentId);
    const blocks = await collabDocument.blocks(run.documentId);

    return {
      title: document?.title ?? "",
      blocks,
      lastIndex: blocks.length - 1,
    };
  }

  if (name === "replace_block") {
    const result = await collabDocument.replaceBlock(
      run.documentId,
      Number(input.index),
      String(input.text ?? ""),
      String(input.expect ?? "")
    );

    return result;
  }

  if (name === "delete_block") {
    return collabDocument.deleteBlock(
      run.documentId,
      Number(input.index),
      String(input.expect ?? "")
    );
  }

  if (name === "insert_block") {
    return collabDocument.insertBlock(
      run.documentId,
      Number(input.after),
      String(input.text ?? ""),
      String(input.type ?? "p")
    );
  }

  if (name === "replace_text") {
    const find = String(input.find ?? "");
    const replace = String(input.replace ?? "");

    if (find.length < 3) {
      return {
        error: "too_short",
        message: "Use a longer snippet — at least a few words.",
      };
    }

    const result = await collabDocument.replace(run.documentId, find, replace);

    if (result.applied) return { applied: true };

    return result.occurrences === 0
      ? {
          error: "no_match",
          message:
            "That text is not in the document. Read it again — someone may have edited it.",
        }
      : {
          error: "multiple_match",
          message: `Found ${result.occurrences} matches. Include more surrounding text so it is unique.`,
        };
  }

  if (name === "insert_after") {
    const anchor = String(input.anchor ?? "");
    const text = String(input.text ?? "");

    const result = await collabDocument.insertAfter(
      run.documentId,
      anchor,
      text
    );

    if (result.applied) return { applied: true };

    return result.occurrences === 0
      ? { error: "no_match", message: "That anchor is not in the document." }
      : {
          error: "multiple_match",
          message: `Found ${result.occurrences} matches. Use a longer anchor.`,
        };
  }

  if (name === "post_message") {
    await chatRepository.create({
      documentId: run.documentId,
      body: String(input.body ?? ""),
      authorId: agent.id,
      runId: run.id,
    });

    return { posted: true };
  }

  return { error: "unknown_tool", message: `No tool named ${name}.` };
}
