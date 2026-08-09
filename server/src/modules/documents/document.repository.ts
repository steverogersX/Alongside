import { and, desc, eq, or } from "drizzle-orm";

import { db, type Tx } from "@/db/client.ts";
import { documents, grants, workspaces } from "@/db/schema/index.ts";
import type { Document, User } from "@/db/types.ts";

export const documentRepository = {
  async findById(documentId: string) {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    return document ?? null;
  },

  /**
   * What this person was last working on, across every workspace they can
   * reach — the thing a home screen should open with.
   */
  async listRecent(user: User, limit: number) {
    const rows = user.isOrgAdmin
      ? await db
          .selectDistinctOn([documents.updatedAt, documents.id], {
            document: documents,
            workspace: workspaces,
          })
          .from(documents)
          .innerJoin(workspaces, eq(workspaces.id, documents.workspaceId))
          .where(eq(workspaces.orgId, user.orgId))
          .orderBy(desc(documents.updatedAt))
          .limit(limit)
      : await db
          .selectDistinctOn([documents.updatedAt, documents.id], {
            document: documents,
            workspace: workspaces,
          })
          .from(documents)
          .innerJoin(workspaces, eq(workspaces.id, documents.workspaceId))
          .innerJoin(
            grants,
            or(
              eq(grants.workspaceId, workspaces.id),
              eq(grants.documentId, documents.id)
            )
          )
          .where(
            and(eq(grants.userId, user.id), eq(workspaces.orgId, user.orgId))
          )
          .orderBy(desc(documents.updatedAt))
          .limit(limit);

    return rows;
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
