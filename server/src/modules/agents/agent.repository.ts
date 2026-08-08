import { and, eq, isNull } from "drizzle-orm";

import { db, type Tx } from "@/db/client.ts";
import { grants, users } from "@/db/schema/index.ts";

export const agentRepository = {
  async listForOrg(orgId: string) {
    return db
      .select()
      .from(users)
      .where(
        and(
          eq(users.orgId, orgId),
          eq(users.kind, "bot"),
          isNull(users.deletedAt)
        )
      );
  },

  async create(input: {
    orgId: string;
    displayName: string;
    model: string;
    createdBy: string;
  }) {
    const [agent] = await db
      .insert(users)
      .values({ ...input, kind: "bot" })
      .returning();

    return agent!;
  },

  async softDelete(tx: Tx, agentId: string, orgId: string) {
    const [agent] = await tx
      .update(users)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(users.id, agentId),
          eq(users.orgId, orgId),
          eq(users.kind, "bot"),
          isNull(users.deletedAt)
        )
      )
      .returning();

    return agent ?? null;
  },

  async revokeGrants(tx: Tx, agentId: string) {
    await tx.delete(grants).where(eq(grants.userId, agentId));
  },
};
