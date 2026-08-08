import { Router } from "express";

import { requireUser } from "@/middleware/auth.ts";
import { validate } from "@/middleware/validate.ts";
import { chatController } from "@/modules/chat/chat.controller.ts";
import { postMessageSchema } from "@/modules/chat/chat.schema.ts";
import { documentController } from "@/modules/documents/document.controller.ts";
import { updateDocumentSchema } from "@/modules/documents/document.schema.ts";
import { runController } from "@/modules/runs/run.controller.ts";
import {
  decideRunSchema,
  runParams,
  startRunSchema,
} from "@/modules/runs/run.schema.ts";
import { idParams, noQuery, paginationQuery } from "@/shared/validation.ts";

export const documentRoutes = Router();

documentRoutes.use(requireUser);

documentRoutes.get(
  "/:id",
  validate({ params: idParams, query: noQuery }),
  documentController.get
);

documentRoutes.patch(
  "/:id",
  validate({ params: idParams, body: updateDocumentSchema, query: noQuery }),
  documentController.update
);

documentRoutes.get(
  "/:id/role",
  validate({ params: idParams, query: noQuery }),
  documentController.role
);

documentRoutes.get(
  "/:id/chat",
  validate({ params: idParams, query: paginationQuery }),
  chatController.list
);

documentRoutes.post(
  "/:id/chat",
  validate({ params: idParams, body: postMessageSchema, query: noQuery }),
  chatController.post
);

documentRoutes.get(
  "/:id/runs",
  validate({ params: idParams, query: paginationQuery }),
  runController.list
);

documentRoutes.post(
  "/:id/runs",
  validate({ params: idParams, body: startRunSchema, query: noQuery }),
  runController.start
);

documentRoutes.post(
  "/:id/runs/:runId/decide",
  validate({ params: runParams, body: decideRunSchema, query: noQuery }),
  runController.decide
);
