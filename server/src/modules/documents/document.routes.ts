import { Router } from "express";

import { requireUser } from "@/middleware/auth.ts";
import { chatController } from "@/modules/chat/chat.controller.ts";
import { documentController } from "@/modules/documents/document.controller.ts";
import { runController } from "@/modules/runs/run.controller.ts";

export const documentRoutes = Router();

documentRoutes.use(requireUser);

documentRoutes.get("/:id", documentController.get);
documentRoutes.patch("/:id", documentController.update);
documentRoutes.get("/:id/role", documentController.role);

documentRoutes.get("/:id/chat", chatController.list);
documentRoutes.post("/:id/chat", chatController.post);

documentRoutes.get("/:id/runs", runController.list);
documentRoutes.post("/:id/runs", runController.start);
documentRoutes.post("/:id/runs/:runId/decide", runController.decide);
