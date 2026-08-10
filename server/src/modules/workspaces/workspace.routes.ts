import { Router } from "express";

import { requireUser } from "@/middleware/auth.ts";
import { workspaceController } from "@/modules/workspaces/workspace.controller.ts";

export const workspaceRoutes = Router();

workspaceRoutes.use(requireUser);

workspaceRoutes.get("/", workspaceController.list);
workspaceRoutes.post("/", workspaceController.create);
workspaceRoutes.get("/:id", workspaceController.detail);
workspaceRoutes.delete("/:id", workspaceController.remove);
workspaceRoutes.get("/:id/agents", workspaceController.agents);
workspaceRoutes.post("/:id/members", workspaceController.addMember);
workspaceRoutes.delete("/:id/members/:userId", workspaceController.removeMember);
workspaceRoutes.post("/:id/documents", workspaceController.createDocument);
