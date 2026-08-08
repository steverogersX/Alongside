import { and, desc, eq, isNull } from "drizzle-orm";

import { db, type Tx } from "@/db/client.ts";
import { documents, grants, users, workspaces } from "@/db/schema/index.ts";
import type { Role } from "@/db/types.ts";

export const workspaceRepository = {
  async listForOrg(orgId: string) {
    return db
      .select()
      .from(workspaces)
      .where(eq(workspaces.orgId, orgId))
      .orderBy(desc(workspaces.createdAt));
  },

  async listForUser(userId: string, orgId: string) {
    const rows = await db
      .select({ workspace: workspaces })
      .from(workspaces)
      .innerJoin(grants, eq(grants.workspaceId, workspaces.id))
      .where(and(eq(grants.userId, userId), eq(workspaces.orgId, orgId)))
      .orderBy(desc(workspaces.createdAt));

    return rows.map((row) => row.workspace);
  },

  async findById(workspaceId: string) {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    return workspace ?? null;
  },

  async create(
    tx: Tx,
    input: {
      orgId: string;
      name: string;
      purpose: string | null;
      createdBy: string;
    }
  ) {
    const [workspace] = await tx.insert(workspaces).values(input).returning();
    return workspace!;
  },

  async listMembers(workspaceId: string) {
    return db
      .select({ user: users, role: grants.role })
      .from(grants)
      .innerJoin(users, eq(users.id, grants.userId))
      .where(and(eq(grants.workspaceId, workspaceId), isNull(users.deletedAt)));
  },

  async listAgents(workspaceId: string) {
    return db
      .select({ agent: users, role: grants.role })
      .from(grants)
      .innerJoin(users, eq(users.id, grants.userId))
      .where(
        and(
          eq(grants.workspaceId, workspaceId),
          eq(users.kind, "bot"),
          isNull(users.deletedAt)
        )
      );
  },

  async listDocuments(workspaceId: string) {
    return db
      .select()
      .from(documents)
      .where(eq(documents.workspaceId, workspaceId))
      .orderBy(desc(documents.updatedAt));
  },

  async findOrgUser(userId: string, orgId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.orgId, orgId),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    return user ?? null;
  },

  async upsertGrant(
    input: {
      userId: string;
      workspaceId: string;
      role: Role;
      grantedBy: string;
    },
    tx: Tx | typeof db = db
  ) {
    const [grant] = await tx
      .insert(grants)
      .values(input)
      .onConflictDoUpdate({
        target: [grants.userId, grants.workspaceId],
        set: { role: input.role, grantedBy: input.grantedBy },
      })
      .returning();

    return grant!;
  },

  async removeGrant(workspaceId: string, userId: string) {
    await db
      .delete(grants)
      .where(
        and(eq(grants.workspaceId, workspaceId), eq(grants.userId, userId))
      );
  },

  async createDocument(input: {
    workspaceId: string;
    title: string;
    createdBy: string;
  }) {
    const [document] = await db.insert(documents).values(input).returning();
    return document!;
  },
};
