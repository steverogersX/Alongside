import { z } from "zod";

import { accessService } from "@/modules/access/access.service.ts";
import { chatRepository } from "@/modules/chat/chat.repository.ts";
import { collabDocument } from "@/modules/collab/collab.document.ts";
import { documentRepository } from "@/modules/documents/document.repository.ts";
import { inScope, type McpIdentity } from "@/modules/mcp/mcp.auth.ts";
import { runRepository } from "@/modules/runs/run.repository.ts";
import { atLeast, lower } from "@/shared/role.ts";
import { workspaceRepository } from "@/modules/workspaces/workspace.repository.ts";
import { uuidSchema } from "@/shared/validation.ts";

export class ToolError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const listDocuments = z.object({ workspaceId: uuidSchema.optional() });
const listMentions = z.object({ limit: z.number().int().min(1).max(50).default(10) });
const readDocument = z.object({ documentId: uuidSchema });
const replaceText = z.object({
  documentId: uuidSchema,
  runId: uuidSchema.optional(),
  find: z.string().min(3).max(4000),
  replace: z.string().max(8000),
});
const insertAfter = z.object({
  documentId: uuidSchema,
  runId: uuidSchema.optional(),
  anchor: z.string().min(3).max(4000),
  text: z.string().min(1).max(8000),
});
const postMessage = z.object({
  documentId: uuidSchema,
  runId: uuidSchema.optional(),
  body: z.string().trim().min(1).max(4000),
});
const completeRun = z.object({
  runId: uuidSchema,
  summary: z.string().trim().min(1).max(2000),
});

/**
 * The agent's seat and the invoking human's own access both cap what a tool
 * call may do — whichever is lower wins, so a connection can never act above
 * the person who made it.
 */
async function reach(identity: McpIdentity, documentId: string) {
  const document = await documentRepository.findById(documentId);
  if (!document) throw new ToolError("not_found", "No such document.");

  if (!inScope(identity, document.workspaceId)) {
    throw new ToolError(
      "out_of_scope",
      "This connection is not scoped to that workspace."
    );
  }

  const humanRole = await accessService.documentRole(identity.user, documentId);
  if (!humanRole) throw new ToolError("not_found", "No such document.");

  const agentRole = await accessService.documentRole(identity.agent, documentId);
  if (!agentRole) {
    throw new ToolError(
      "no_seat",
      "That agent has no seat in this workspace. Add it under Members."
    );
  }

  return { document, role: lower(agentRole, humanRole) };
}

function requireEditor(role: string) {
  if (!atLeast(role as never, "editor")) {
    throw new ToolError(
      "forbidden",
      "Read-only here — either your seat or your own access is viewer."
    );
  }
}

async function activeRun(runId: string | undefined) {
  if (!runId) return null;

  const run = await runRepository.find(runId);
  if (!run) throw new ToolError("not_found", "No such run.");
  if (run.status === "cancelled") {
    throw new ToolError("run_cancelled", "That run was stopped. Do nothing more.");
  }

  return run;
}

type Node = { type?: string; text?: string; content?: Node[] };

/**
 * The live Y.Doc is the truth while anyone has the document open, but it only
 * exists once someone does — otherwise fall back to what was last stored.
 */
function storedText(content: unknown): string {
  const blocks: string[] = [];

  const walk = (node: Node, into: string[]) => {
    if (typeof node.text === "string") into.push(node.text);
    for (const child of node.content ?? []) walk(child, into);
  };

  for (const block of (content as Node)?.content ?? []) {
    const parts: string[] = [];
    walk(block, parts);
    if (parts.length > 0) blocks.push(parts.join(""));
  }

  return blocks.join("\n\n");
}

export const tools = [
  {
    name: "list_documents",
    description:
      "List Alongside documents this connection can reach, newest first.",
    schema: listDocuments,
    async run(identity: McpIdentity, input: z.infer<typeof listDocuments>) {
      const workspaces = await workspaceRepository.listForUser(
        identity.user.id,
        identity.user.orgId
      );

      const reachable = workspaces.filter(
        (workspace) =>
          inScope(identity, workspace.id) &&
          (!input.workspaceId || workspace.id === input.workspaceId)
      );

      const documents = await Promise.all(
        reachable.map(async (workspace) => {
          const list = await workspaceRepository.listDocuments(workspace.id);
          return list.map((document) => ({
            id: document.id,
            title: document.title,
            status: document.status,
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            updatedAt: document.updatedAt,
          }));
        })
      );

      return documents.flat();
    },
  },
  {
    name: "list_mentions",
    description:
      "Pending @mentions asking this agent to do something. Start here.",
    schema: listMentions,
    async run(identity: McpIdentity, input: z.infer<typeof listMentions>) {
      const rows = await runRepository.queuedForUser(
        identity.user.id,
        input.limit
      );

      return rows
        .filter((row) => inScope(identity, row.document.workspaceId))
        .map((row) => ({
          runId: row.run.id,
          documentId: row.document.id,
          documentTitle: row.document.title,
          prompt: row.run.prompt,
          ceiling: row.run.ceiling,
          askedAt: row.run.createdAt,
        }));
    },
  },
  {
    name: "read_document",
    description: "Read the live text of a document.",
    schema: readDocument,
    async run(identity: McpIdentity, input: z.infer<typeof readDocument>) {
      const { document, role } = await reach(identity, input.documentId);
      const live = await collabDocument.read(input.documentId);

      return {
        title: document.title,
        status: document.status,
        canEdit: atLeast(role, "editor"),
        live: live.length > 0,
        content: live.length > 0 ? live : storedText(document.content),
      };
    },
  },
  {
    name: "replace_text",
    description:
      "Replace an exact snippet. The snippet must appear exactly once — include surrounding words to disambiguate.",
    schema: replaceText,
    async run(identity: McpIdentity, input: z.infer<typeof replaceText>) {
      const { role } = await reach(identity, input.documentId);
      requireEditor(role);

      const run = await activeRun(input.runId);
      if (run) await runRepository.claim(run.id, identity.connection.id);

      const result = await collabDocument.replace(
        input.documentId,
        input.find,
        input.replace
      );

      if (!result.applied) {
        throw new ToolError(
          result.occurrences === 0 ? "no_match" : "multiple_match",
          result.occurrences === 0
            ? "That text is not in the document — read it again."
            : `Found ${result.occurrences} matches. Include more surrounding text.`
        );
      }

      return result;
    },
  },
  {
    name: "insert_after",
    description: "Append text after the paragraph containing an exact anchor.",
    schema: insertAfter,
    async run(identity: McpIdentity, input: z.infer<typeof insertAfter>) {
      const { role } = await reach(identity, input.documentId);
      requireEditor(role);

      const run = await activeRun(input.runId);
      if (run) await runRepository.claim(run.id, identity.connection.id);

      const result = await collabDocument.insertAfter(
        input.documentId,
        input.anchor,
        input.text
      );

      if (!result.applied) {
        throw new ToolError(
          result.occurrences === 0 ? "no_match" : "multiple_match",
          result.occurrences === 0
            ? "That anchor is not in the document."
            : `Found ${result.occurrences} matches. Use a longer anchor.`
        );
      }

      return result;
    },
  },
  {
    name: "post_message",
    description: "Post a message to the document's chat as this agent.",
    schema: postMessage,
    async run(identity: McpIdentity, input: z.infer<typeof postMessage>) {
      await reach(identity, input.documentId);
      await activeRun(input.runId);

      const message = await chatRepository.create({
        documentId: input.documentId,
        body: input.body,
        authorId: identity.agent.id,
        runId: input.runId ?? null,
      });

      return { messageId: message.id };
    },
  },
  {
    name: "complete_run",
    description: "Mark a mention as handled, with a one-line summary.",
    schema: completeRun,
    async run(identity: McpIdentity, input: z.infer<typeof completeRun>) {
      const run = await activeRun(input.runId);
      if (!run) throw new ToolError("not_found", "No such run.");

      await chatRepository.create({
        documentId: run.documentId,
        body: input.summary,
        authorId: identity.agent.id,
        runId: run.id,
      });

      const finished = await runRepository.finish(run.id, {
        status: "succeeded",
        summary: input.summary,
      });

      return { status: finished?.status ?? "succeeded" };
    },
  },
] as const;
