import { Router } from "express";

import { requireOrgAdmin, requireUser } from "@/middleware/auth.ts";
import { validate } from "@/middleware/validate.ts";
import { agentController } from "@/modules/agents/agent.controller.ts";
import { createAgentSchema } from "@/modules/agents/agent.schema.ts";
import { idParams } from "@/shared/validation.ts";

export const agentRoutes = Router();

agentRoutes.use(requireUser);

agentRoutes.get("/", agentController.list);

agentRoutes.post(
  "/",
  requireOrgAdmin,
  validate({ body: createAgentSchema }),
  agentController.create
);

agentRoutes.delete(
  "/:id",
  requireOrgAdmin,
  validate({ params: idParams }),
  agentController.remove
);
