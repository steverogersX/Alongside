import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db/client.ts";
import { documentLinks } from "@/db/schema/index.ts";
import type { Role } from "@/db/types.ts";

export const linkRepository = {
  async listForDocument(documentId: string) {
    return db
      .select()
      .from(documentLinks)
      .where(
        and(
          eq(documentLinks.documentId, documentId),
          isNull(documentLinks.revokedAt)
        )
      )
      .orderBy(desc(documentLinks.createdAt));
  },

  async findById(linkId: string) {
    const [link] = await db
      .select()
      .from(documentLinks)
      .where(eq(documentLinks.id, linkId))
      .limit(1);

    return link ?? null;
  },

  async findByTokenHash(tokenHash: string) {
    const [link] = await db
      .select()
      .from(documentLinks)
      .where(eq(documentLinks.tokenHash, tokenHash))
      .limit(1);

    return link ?? null;
  },

  async create(input: {
    documentId: string;
    tokenHash: string;
    role: Role;
    label: string | null;
    expiresAt: Date | null;
    createdBy: string;
  }) {
    const [link] = await db.insert(documentLinks).values(input).returning();
    return link!;
  },

  async revoke(linkId: string, documentId: string) {
    const [link] = await db
      .update(documentLinks)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(documentLinks.id, linkId),
          eq(documentLinks.documentId, documentId),
          isNull(documentLinks.revokedAt)
        )
      )
      .returning();

    return link ?? null;
  },
};
