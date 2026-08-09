import { and, eq, isNull, or } from "drizzle-orm";

import { db } from "@/db/client.ts";
import { documents, grants, users, workspaces } from "@/db/schema/index.ts";
import type { Role } from "@/db/types.ts";

export const accessRepository = {
  async findWorkspace(workspaceId: string) {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    return workspace ?? null;
  },

  async findDocumentWithWorkspace(documentId: string) {
    const [row] = await db
      .select({ document: documents, workspace: workspaces })
      .from(documents)
      .innerJoin(workspaces, eq(workspaces.id, documents.workspaceId))
      .where(eq(documents.id, documentId))
      .limit(1);

    return row ?? null;
  },

  async rolesForWorkspace(userId: string, workspaceId: string) {
    const rows = await db
      .select({ role: grants.role })
      .from(grants)
      .where(and(eq(grants.userId, userId), eq(grants.workspaceId, workspaceId)));

    return rows.map((row) => row.role as Role);
  },

  async rolesForDocument(
    userId: string,
    documentId: string,
    workspaceId: string
  ) {
    const rows = await db
      .select({ role: grants.role })
      .from(grants)
      .where(
        and(
          eq(grants.userId, userId),
          or(
            eq(grants.documentId, documentId),
            eq(grants.workspaceId, workspaceId)
          )
        )
      );

    return rows.map((row) => row.role as Role);
  },

  async agentsForDocument(documentId: string) {
    const rows = await db
      .selectDistinctOn([users.id])
      .from(grants)
      .innerJoin(users, eq(users.id, grants.userId))
      .innerJoin(
        documents,
        or(
          eq(documents.id, grants.documentId),
          eq(documents.workspaceId, grants.workspaceId)
        )
      )
      .where(
        and(
          eq(documents.id, documentId),
          eq(users.kind, "bot"),
          isNull(users.deletedAt)
        )
      );

    return rows.map((row) => row.users);
  },

  async findAgent(agentId: string, orgId: string) {
    const [agent] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, agentId),
          eq(users.orgId, orgId),
          eq(users.kind, "bot"),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    return agent ?? null;
  },
};
