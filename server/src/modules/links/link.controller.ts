import { linkService } from "@/modules/links/link.service.ts";
import {
  createLinkSchema,
  openParams,
  linkParams,
  tokenParams,
} from "@/modules/links/link.schema.ts";
import { linkToken } from "@/modules/links/link.token.ts";
import { AppError, notFound } from "@/shared/errors.ts";
import { corsOrigins } from "@/config/env.ts";
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

  /**
   * The browser has to arrive at the API itself, not be proxied through the
   * app: a cookie set on the app's host is never sent to the API's, so a guest
   * would redeem a link and still be a stranger on the next request.
   */
  open: publicRoute(
    { params: openParams, query: noQuery },
    async ({ params, res }) => {
      const app = corsOrigins[0] ?? "/";

      try {
        const { documentId } = await linkService.redeem(params.token, res);
        res.redirect(`${app}/d/${documentId}`);
      } catch (error) {
        const reason =
          error instanceof AppError ? error.message : "This link is not valid";

        res.redirect(
          `${app}/link-unavailable?reason=${encodeURIComponent(reason)}`
        );
      }
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
