import { asc, desc, eq } from "drizzle-orm";

import { db, type Tx } from "@/db/client.ts";
import { chatMessages, users } from "@/db/schema/index.ts";

export const chatRepository = {
  async listForDocument(documentId: string, limit: number, offset: number) {
    return db
      .select({ message: chatMessages, author: users })
      .from(chatMessages)
      .leftJoin(users, eq(users.id, chatMessages.authorId))
      .where(eq(chatMessages.documentId, documentId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit)
      .offset(offset);
  },

  /**
   * Newest first, because an agent reading back through the conversation wants
   * the end of it — and how far back it goes is its own decision.
   */
  async recentForDocument(documentId: string, limit: number) {
    return db
      .select({ message: chatMessages, author: users })
      .from(chatMessages)
      .leftJoin(users, eq(users.id, chatMessages.authorId))
      .where(eq(chatMessages.documentId, documentId))
      .orderBy(desc(chatMessages.createdAt), desc(chatMessages.id))
      .limit(limit);
  },

  async create(
    input: {
      documentId: string;
      body: string;
      runId?: string | null;
      authorId?: string | null;
      authorLinkId?: string | null;
      authorVisitorId?: string | null;
      authorName?: string | null;
    },
    tx: Tx | typeof db = db
  ) {
    const [message] = await tx
      .insert(chatMessages)
      .values({
        documentId: input.documentId,
        body: input.body,
        runId: input.runId ?? null,
        authorId: input.authorId ?? null,
        authorLinkId: input.authorLinkId ?? null,
        authorVisitorId: input.authorVisitorId ?? null,
        authorName: input.authorName ?? null,
      })
      .returning();

    return message!;
  },
};
