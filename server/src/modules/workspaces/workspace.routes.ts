import { Router } from "express";

import { requireUser } from "@/middleware/auth.ts";
import { validate } from "@/middleware/validate.ts";
import { workspaceController } from "@/modules/workspaces/workspace.controller.ts";
import {
  addMemberSchema,
  createDocumentSchema,
  createWorkspaceSchema,
  memberParams,
} from "@/modules/workspaces/workspace.schema.ts";
import { idParams } from "@/shared/validation.ts";

export const workspaceRoutes = Router();

workspaceRoutes.use(requireUser);

workspaceRoutes.get("/", workspaceController.list);

workspaceRoutes.post(
  "/",
  validate({ body: createWorkspaceSchema }),
  workspaceController.create
);

workspaceRoutes.get(
  "/:id",
  validate({ params: idParams }),
  workspaceController.detail
);

workspaceRoutes.get(
  "/:id/agents",
  validate({ params: idParams }),
  workspaceController.agents
);

workspaceRoutes.post(
  "/:id/members",
  validate({ params: idParams, body: addMemberSchema }),
  workspaceController.addMember
);

workspaceRoutes.delete(
  "/:id/members/:userId",
  validate({ params: memberParams }),
  workspaceController.removeMember
);

workspaceRoutes.post(
  "/:id/documents",
  validate({ params: idParams, body: createDocumentSchema }),
  workspaceController.createDocument
);
