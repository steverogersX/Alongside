import { heartbeatSchema } from "@/modules/presence/presence.schema.ts";
import { presenceService } from "@/modules/presence/presence.service.ts";
import { ok } from "@/shared/response.ts";
import { publicRoute } from "@/shared/route.ts";
import { idParams, noBody, noQuery } from "@/shared/validation.ts";

export const presenceController = {
  heartbeat: publicRoute(
    { params: idParams, body: heartbeatSchema, query: noQuery },
    async ({ params, body, req, res }) => {
      const viewers = await presenceService.heartbeat(req, params.id, body);
      ok(res, { viewers }, { count: viewers.length });
    }
  ),

  leave: publicRoute(
    { params: idParams, body: noBody, query: noQuery },
    async ({ params, req, res }) => {
      await presenceService.leave(req, params.id);
      ok(res, { left: true });
    }
  ),
};
