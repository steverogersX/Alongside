import { Router } from "express";

import { requireOrgAdmin, requireUser } from "@/middleware/auth.ts";
import { agentController } from "@/modules/agents/agent.controller.ts";

export const agentRoutes = Router();

agentRoutes.use(requireUser);

agentRoutes.get("/", agentController.list);
agentRoutes.post("/", requireOrgAdmin, agentController.create);
agentRoutes.delete("/:id", requireOrgAdmin, agentController.remove);
