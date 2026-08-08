import type { Request, Response } from "express";

import { documentService } from "@/modules/documents/document.service.ts";
import type { UpdateDocumentInput } from "@/modules/documents/document.schema.ts";
import { body, currentUser, param } from "@/shared/request.ts";
import { ok } from "@/shared/response.ts";

export const documentController = {
  async get(req: Request, res: Response) {
    const result = await documentService.get(currentUser(req), param(req, "id"));
    ok(res, result);
  },

  async update(req: Request, res: Response) {
    const document = await documentService.update(
      currentUser(req),
      param(req, "id"),
      body<UpdateDocumentInput>(req)
    );
    ok(res, { document });
  },

  async role(req: Request, res: Response) {
    const role = await documentService.role(currentUser(req), param(req, "id"));
    ok(res, { role });
  },
};
