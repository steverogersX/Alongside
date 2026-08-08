import type { Request, Response } from "express";

import { agentService } from "@/modules/agents/agent.service.ts";
import type { CreateAgentInput } from "@/modules/agents/agent.schema.ts";
import { body, currentUser, param } from "@/shared/request.ts";
import { created, ok } from "@/shared/response.ts";

export const agentController = {
  async list(req: Request, res: Response) {
    const agents = await agentService.list(currentUser(req));
    ok(res, { agents }, { count: agents.length });
  },

  async create(req: Request, res: Response) {
    const agent = await agentService.create(
      currentUser(req),
      body<CreateAgentInput>(req)
    );
    created(res, { agent });
  },

  async remove(req: Request, res: Response) {
    await agentService.remove(currentUser(req), param(req, "id"));
    ok(res, { removed: true });
  },
};
