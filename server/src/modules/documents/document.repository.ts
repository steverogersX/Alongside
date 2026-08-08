import { eq } from "drizzle-orm";

import { db, type Tx } from "@/db/client.ts";
import { documents } from "@/db/schema/index.ts";
import type { Document } from "@/db/types.ts";

export const documentRepository = {
  async findById(documentId: string) {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    return document ?? null;
  },

  async update(
    documentId: string,
    patch: Partial<Pick<Document, "title" | "status" | "content">>,
    tx: Tx | typeof db = db
  ) {
    const [document] = await tx
      .update(documents)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(documents.id, documentId))
      .returning();

    return document!;
  },
};
