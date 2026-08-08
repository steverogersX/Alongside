import { asc, eq } from "drizzle-orm";

import { db, type Tx } from "@/db/client.ts";
import { chatMessages, users } from "@/db/schema/index.ts";

export const chatRepository = {
  async listForDocument(documentId: string) {
    return db
      .select({ message: chatMessages, author: users })
      .from(chatMessages)
      .innerJoin(users, eq(users.id, chatMessages.authorId))
      .where(eq(chatMessages.documentId, documentId))
      .orderBy(asc(chatMessages.createdAt));
  },

  async create(
    input: {
      documentId: string;
      authorId: string;
      body: string;
      runId?: string | null;
    },
    tx: Tx | typeof db = db
  ) {
    const [message] = await tx
      .insert(chatMessages)
      .values({
        documentId: input.documentId,
        authorId: input.authorId,
        body: input.body,
        runId: input.runId ?? null,
      })
      .returning();

    return message!;
  },
};
