import { linkService } from "@/modules/links/link.service.ts";
import {
  createLinkSchema,
  linkParams,
  tokenParams,
} from "@/modules/links/link.schema.ts";
import { linkToken } from "@/modules/links/link.token.ts";
import { notFound } from "@/shared/errors.ts";
import { created, ok } from "@/shared/response.ts";
import { publicRoute, route } from "@/shared/route.ts";
import { idParams, noBody, noQuery } from "@/shared/validation.ts";

export const linkController = {
  list: route(
    { params: idParams, query: noQuery },
    async ({ params, user, res }) => {
      const links = await linkService.list(user, params.id);
      ok(res, { links }, { count: links.length });
    }
  ),

  create: route(
    { params: idParams, body: createLinkSchema, query: noQuery },
    async ({ params, body, user, res }) => {
      const { link, token } = await linkService.create(user, params.id, body);
      created(res, { link, token });
    }
  ),

  revoke: route(
    { params: linkParams, query: noQuery },
    async ({ params, user, res }) => {
      const link = await linkService.revoke(user, params.id, params.linkId);
      ok(res, { link });
    }
  ),

  redeem: publicRoute(
    { params: tokenParams, body: noBody, query: noQuery },
    async ({ params, res }) => {
      ok(res, await linkService.redeem(params.token, res));
    }
  ),

  session: publicRoute({ query: noQuery }, async ({ req, res }) => {
    if (!req.link) throw notFound("No link session");
    ok(res, {
      documentId: req.link.documentId,
      role: req.link.role,
    });
  }),

  leave: publicRoute({ body: noBody, query: noQuery }, ({ res }) => {
    linkToken.clear(res);
    ok(res, { left: true });
  }),
};
