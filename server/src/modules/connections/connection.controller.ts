import { connectionService } from "@/modules/connections/connection.service.ts";
import { createConnectionSchema } from "@/modules/connections/connection.schema.ts";
import { created, ok } from "@/shared/response.ts";
import { route } from "@/shared/route.ts";
import { idParams, noQuery } from "@/shared/validation.ts";

export const connectionController = {
  list: route({ query: noQuery }, async ({ user, res }) => {
    const connections = await connectionService.list(user);
    ok(res, { connections }, { count: connections.length });
  }),

  create: route(
    { body: createConnectionSchema, query: noQuery },
    async ({ body, user, res }) => {
      created(res, await connectionService.create(user, body));
    }
  ),

  revoke: route(
    { params: idParams, query: noQuery },
    async ({ params, user, res }) => {
      await connectionService.revoke(user, params.id);
      ok(res, { revoked: true });
    }
  ),
};
