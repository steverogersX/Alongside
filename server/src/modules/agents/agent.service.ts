import { db } from "@/db/client.ts";
import type { User } from "@/db/types.ts";
import { agentRepository } from "@/modules/agents/agent.repository.ts";
import type { CreateAgentInput } from "@/modules/agents/agent.schema.ts";
import { toPublicUser } from "@/modules/auth/auth.mapper.ts";
import { notFound } from "@/shared/errors.ts";

export const agentService = {
  async list(user: User) {
    const agents = await agentRepository.listForOrg(user.orgId);
    return agents.map(toPublicUser);
  },

  async create(user: User, input: CreateAgentInput) {
    const agent = await agentRepository.create({
      orgId: user.orgId,
      displayName: input.displayName,
      model: input.model,
      createdBy: user.id,
    });

    return toPublicUser(agent);
  },

  async remove(user: User, agentId: string) {
    await db.transaction(async (tx) => {
      const agent = await agentRepository.softDelete(tx, agentId, user.orgId);
      if (!agent) throw notFound("Agent not found");
      await agentRepository.revokeGrants(tx, agentId);
    });
  },
};
