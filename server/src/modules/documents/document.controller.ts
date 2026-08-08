import { documentService } from "@/modules/documents/document.service.ts";
import { updateDocumentSchema } from "@/modules/documents/document.schema.ts";
import { ok } from "@/shared/response.ts";
import { route } from "@/shared/route.ts";
import { idParams, noQuery } from "@/shared/validation.ts";

export const documentController = {
  get: route(
    { params: idParams, query: noQuery },
    async ({ params, user, res }) => {
      ok(res, await documentService.get(user, params.id));
    }
  ),

  update: route(
    { params: idParams, body: updateDocumentSchema, query: noQuery },
    async ({ params, body, user, res }) => {
      const document = await documentService.update(user, params.id, body);
      ok(res, { document });
    }
  ),

  role: route(
    { params: idParams, query: noQuery },
    async ({ params, user, res }) => {
      ok(res, { role: await documentService.role(user, params.id) });
    }
  ),
};
