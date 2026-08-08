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
import { idParams, noQuery } from "@/shared/validation.ts";

export const workspaceRoutes = Router();

workspaceRoutes.use(requireUser);

workspaceRoutes.get(
  "/",
  validate({ query: noQuery }),
  workspaceController.list
);

workspaceRoutes.post(
  "/",
  validate({ body: createWorkspaceSchema, query: noQuery }),
  workspaceController.create
);

workspaceRoutes.get(
  "/:id",
  validate({ params: idParams, query: noQuery }),
  workspaceController.detail
);

workspaceRoutes.get(
  "/:id/agents",
  validate({ params: idParams, query: noQuery }),
  workspaceController.agents
);

workspaceRoutes.post(
  "/:id/members",
  validate({ params: idParams, body: addMemberSchema, query: noQuery }),
  workspaceController.addMember
);

workspaceRoutes.delete(
  "/:id/members/:userId",
  validate({ params: memberParams, query: noQuery }),
  workspaceController.removeMember
);

workspaceRoutes.post(
  "/:id/documents",
  validate({ params: idParams, body: createDocumentSchema, query: noQuery }),
  workspaceController.createDocument
);
