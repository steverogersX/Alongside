import type { Request } from "express";

import type { ChatMessage, User } from "@/db/types.ts";
import { accessService } from "@/modules/access/access.service.ts";
import { toPublicUser } from "@/modules/auth/auth.mapper.ts";
import { chatRepository } from "@/modules/chat/chat.repository.ts";
import type { PostMessageInput } from "@/modules/chat/chat.schema.ts";
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
      const message = await chatRepository.create({
        documentId,
        body: input.body,
        authorId: req.user.id,
      });

      return present({ message, author: req.user });
    }

    const link = req.link!;
    const message = await chatRepository.create({
      documentId,
      body: input.body,
      authorLinkId: link.linkId,
      authorVisitorId: link.visitorId,
      authorName: link.guestName,
    });

    return present({ message, author: null });
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
