import { agentService } from "@/modules/agents/agent.service.ts";
import { createAgentSchema } from "@/modules/agents/agent.schema.ts";
import { created, ok } from "@/shared/response.ts";
import { route } from "@/shared/route.ts";
import { idParams, noQuery } from "@/shared/validation.ts";

export const agentController = {
  list: route({ query: noQuery }, async ({ user, res }) => {
    const agents = await agentService.list(user);
    ok(res, { agents }, { count: agents.length });
  }),

  create: route(
    { body: createAgentSchema, query: noQuery },
    async ({ body, user, res }) => {
      const agent = await agentService.create(user, body);
      created(res, { agent });
    }
  ),

  remove: route(
    { params: idParams, query: noQuery },
    async ({ params, user, res }) => {
      await agentService.remove(user, params.id);
      ok(res, { removed: true });
    }
  ),
};
