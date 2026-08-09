import type { Request } from "express";

import { db } from "@/db/client.ts";
import type { ChatMessage, User } from "@/db/types.ts";
import { accessRepository } from "@/modules/access/access.repository.ts";
import { accessService } from "@/modules/access/access.service.ts";
import { toPublicUser } from "@/modules/auth/auth.mapper.ts";
import {
  findMentions,
  firstName,
  stripMention,
} from "@/modules/chat/chat.mention.ts";
import { chatRepository } from "@/modules/chat/chat.repository.ts";
import type { PostMessageInput } from "@/modules/chat/chat.schema.ts";
import { runRepository } from "@/modules/runs/run.repository.ts";
import { forbidden, notFound } from "@/shared/errors.ts";
import type { PaginationQuery } from "@/shared/validation.ts";

type Row = { message: ChatMessage; author: User | null };

function present(row: Row) {
  const { message, author } = row;

  return {
    ...message,
    author: author
      ? { ...toPublicUser(author), isGuest: false }
      : {
          id: message.authorVisitorId ?? message.id,
          orgId: null,
          kind: "human" as const,
          displayName: message.authorName ?? "Guest",
          avatarSeed: message.authorVisitorId ?? message.id,
          isOrgAdmin: false,
          email: null,
          model: null,
          isGuest: true,
        },
  };
}

export const chatService = {
  async list(req: Request, documentId: string, page: PaginationQuery) {
    const access = await accessService.contextAccess(req, documentId);
    if (!access) throw notFound("Document not found");
    if (access.chat === "none") {
      throw forbidden("This document's chat is not shared with you");
    }

    const rows = await chatRepository.listForDocument(
      documentId,
      page.limit,
      page.offset
    );

    return rows.map(present);
  },

  async post(req: Request, documentId: string, input: PostMessageInput) {
    const access = await accessService.contextAccess(req, documentId);
    if (!access) throw notFound("Document not found");
    if (access.chat !== "write") {
      throw forbidden("You have read-only access to this chat");
    }

    if (req.user) {
      const invoker = req.user;
      const agent = await this.resolveMention(invoker, documentId, input.body);

      const { message, run } = await db.transaction(async (tx) => {
        const message = await chatRepository.create(
          { documentId, body: input.body, authorId: invoker.id },
          tx
        );

        if (!agent) return { message, run: null };

        const run = await runRepository.create(tx, {
          documentId,
          agentId: agent.user.id,
          invokedBy: invoker.id,
          prompt: stripMention(input.body, agent.name),
          ceiling: agent.ceiling,
          status: "queued",
          triggerMessageId: message.id,
        });

        return { message, run };
      });

      return { ...present({ message, author: invoker }), run };
    }

    const link = req.link!;
    const message = await chatRepository.create({
      documentId,
      body: input.body,
      authorLinkId: link.linkId,
      authorVisitorId: link.visitorId,
      authorName: link.guestName,
    });

    return { ...present({ message, author: null }), run: null };
  },

  /**
   * Only a human's message can start a run — an agent that mentions itself in
   * its own reply would otherwise queue work forever.
   */
  async resolveMention(invoker: User, documentId: string, body: string) {
    if (invoker.kind !== "human") return null;

    const names = findMentions(body);
    if (names.length === 0) return null;

    const agents = await accessRepository.agentsForDocument(documentId);

    for (const name of names) {
      const agent = agents.find((row) => firstName(row.displayName) === name);
      if (!agent) continue;

      const ceiling = await accessService.resolveCeiling(
        agent.id,
        invoker,
        documentId
      );

      return { user: agent, name, ceiling };
    }

    return null;
  },

  async access(req: Request, documentId: string) {
    const access = await accessService.contextAccess(req, documentId);
    if (!access) throw notFound("Document not found");

    return {
      chat: access.chat,
      viewerId: req.user?.id ?? req.link?.visitorId ?? null,
    };
  },
};
