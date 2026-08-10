import { accessService } from "@/modules/access/access.service.ts";
import { documentService } from "@/modules/documents/document.service.ts";
import { updateDocumentSchema } from "@/modules/documents/document.schema.ts";
import { ok } from "@/shared/response.ts";
import { publicRoute, route } from "@/shared/route.ts";
import {
  idParams,
  noQuery,
  paginationQuery,
} from "@/shared/validation.ts";

export const documentController = {
  recent: route({ query: paginationQuery }, async ({ query, user, res }) => {
    const documents = await documentService.recent(user, query.limit);
    ok(res, { documents }, { count: documents.length });
  }),

  get: publicRoute(
    { params: idParams, query: noQuery },
    async ({ params, req, res }) => {
      const access = await accessService.contextAccess(req, params.id);
      ok(res, await documentService.get(params.id, access));
    }
  ),

  update: publicRoute(
    { params: idParams, body: updateDocumentSchema, query: noQuery },
    async ({ params, body, req, res }) => {
      const access = await accessService.contextAccess(req, params.id);
      const document = await documentService.update(
        params.id,
        access?.role ?? null,
        body
      );
      ok(res, { document });
    }
  ),

  remove: route(
    { params: idParams, query: noQuery },
    async ({ params, user, res }) => {
      await documentService.remove(user, params.id);
      ok(res, { deleted: true });
    }
  ),

  role: publicRoute(
    { params: idParams, query: noQuery },
    async ({ params, req, res }) => {
      const access = await accessService.contextAccess(req, params.id);
      ok(res, { role: documentService.role(access?.role ?? null) });
    }
  ),
};
