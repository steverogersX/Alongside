import { eq } from "drizzle-orm";

import { env } from "@/config/env.ts";
import { db } from "@/db/client.ts";
import { users } from "@/db/schema/index.ts";
import type { AgentConnection, User } from "@/db/types.ts";
import { connectionRepository } from "@/modules/connections/connection.repository.ts";
import type { CreateConnectionInput } from "@/modules/connections/connection.schema.ts";
import { notFound } from "@/shared/errors.ts";
import { hashToken, mintToken } from "@/shared/token.ts";

function present(connection: AgentConnection, agent: User) {
  return {
    id: connection.id,
    label: connection.label,
    agentId: agent.id,
    agentName: agent.displayName,
    model: agent.model,
    workspaceIds: connection.workspaceIds,
    lastSeenAt: connection.lastSeenAt,
    revokedAt: connection.revokedAt,
    createdAt: connection.createdAt,
  };
}

const mcpUrl = () => `${env.API_ORIGIN}/api/mcp`;

export const connectionService = {
  async list(user: User) {
    const rows = await connectionRepository.listForUser(user.id);
    return rows.map((row) => present(row.connection, row.agent));
  },

  async create(user: User, input: CreateConnectionInput) {
    const [agent] = await db
      .select()
      .from(users)
      .where(eq(users.id, input.agentId))
      .limit(1);

    if (!agent || agent.kind !== "bot" || agent.orgId !== user.orgId) {
      throw notFound("Agent not found");
    }

    const token = mintToken("als");

    const connection = await connectionRepository.create({
      userId: user.id,
      agentId: agent.id,
      tokenHash: hashToken(token),
      label: input.label,
      workspaceIds: input.workspaceIds ?? null,
    });

    return {
      connection: present(connection, agent),
      token,
      command: `claude mcp add --transport http alongside ${mcpUrl()} --header "Authorization: Bearer ${token}"`,
    };
  },

  async revoke(user: User, id: string) {
    const connection = await connectionRepository.revoke(id, user.id);
    if (!connection) throw notFound("Connection not found");
  },

  async resolve(token: string) {
    const row = await connectionRepository.findByTokenHash(hashToken(token));
    if (!row || row.connection.revokedAt) return null;

    const [owner] = await db
      .select()
      .from(users)
      .where(eq(users.id, row.connection.userId))
      .limit(1);

    if (!owner || owner.deletedAt) return null;

    return { connection: row.connection, agent: row.agent, user: owner };
  },
};
