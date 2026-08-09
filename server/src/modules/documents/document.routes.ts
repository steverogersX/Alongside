import { Router } from "express";

import { requireUser } from "@/middleware/auth.ts";
import { chatController } from "@/modules/chat/chat.controller.ts";
import { documentController } from "@/modules/documents/document.controller.ts";
import { linkController } from "@/modules/links/link.controller.ts";
import { presenceController } from "@/modules/presence/presence.controller.ts";
import { runController } from "@/modules/runs/run.controller.ts";

export const documentRoutes = Router();

documentRoutes.get("/:id", documentController.get);
documentRoutes.patch("/:id", documentController.update);
documentRoutes.get("/:id/role", documentController.role);

documentRoutes.get("/:id/identity", presenceController.identity);
documentRoutes.post("/:id/presence", presenceController.heartbeat);
documentRoutes.post("/:id/presence/leave", presenceController.leave);

documentRoutes.get("/:id/chat", chatController.list);
documentRoutes.get("/:id/chat/access", chatController.access);
documentRoutes.post("/:id/chat", chatController.post);

documentRoutes.get("/:id/runs", requireUser, runController.list);
documentRoutes.post("/:id/runs", requireUser, runController.start);
documentRoutes.post("/:id/runs/:runId/decide", requireUser, runController.decide);

documentRoutes.get("/:id/links", requireUser, linkController.list);
documentRoutes.post("/:id/links", requireUser, linkController.create);
documentRoutes.delete("/:id/links/:linkId", requireUser, linkController.revoke);
