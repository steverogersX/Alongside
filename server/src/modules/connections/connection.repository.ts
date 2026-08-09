import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db/client.ts";
import { agentConnections, users } from "@/db/schema/index.ts";

export const connectionRepository = {
  async listForUser(userId: string) {
    return db
      .select({ connection: agentConnections, agent: users })
      .from(agentConnections)
      .innerJoin(users, eq(users.id, agentConnections.agentId))
      .where(
        and(
          eq(agentConnections.userId, userId),
          isNull(agentConnections.revokedAt)
        )
      )
      .orderBy(desc(agentConnections.createdAt));
  },

  async create(input: {
    userId: string;
    agentId: string;
    tokenHash: string;
    label: string;
    workspaceIds: string[] | null;
  }) {
    const [connection] = await db
      .insert(agentConnections)
      .values(input)
      .returning();

    return connection!;
  },

  async findByTokenHash(tokenHash: string) {
    const [row] = await db
      .select({ connection: agentConnections, agent: users })
      .from(agentConnections)
      .innerJoin(users, eq(users.id, agentConnections.agentId))
      .where(eq(agentConnections.tokenHash, tokenHash))
      .limit(1);

    return row ?? null;
  },

  async revoke(id: string, userId: string) {
    const [connection] = await db
      .update(agentConnections)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(agentConnections.id, id),
          eq(agentConnections.userId, userId),
          isNull(agentConnections.revokedAt)
        )
      )
      .returning();

    return connection ?? null;
  },

  async touch(id: string) {
    await db
      .update(agentConnections)
      .set({ lastSeenAt: new Date() })
      .where(eq(agentConnections.id, id));
  },
};
