import { runService } from "@/modules/runs/run.service.ts";
import {
  decideRunSchema,
  runParams,
  startRunSchema,
} from "@/modules/runs/run.schema.ts";
import { accepted, ok } from "@/shared/response.ts";
import { route } from "@/shared/route.ts";
import { idParams, noQuery, paginationQuery } from "@/shared/validation.ts";

export const runController = {
  list: route(
    { params: idParams, query: paginationQuery },
    async ({ params, query, user, res }) => {
      const runs = await runService.list(user, params.id, query);
      ok(res, { runs }, { count: runs.length });
    }
  ),

  start: route(
    { params: idParams, body: startRunSchema, query: noQuery },
    async ({ params, body, user, res }) => {
      const run = await runService.start(user, params.id, body);
      accepted(res, { run });
    }
  ),

  decide: route(
    { params: runParams, body: decideRunSchema, query: noQuery },
    async ({ params, body, user, res }) => {
      const run = await runService.decide(user, params.id, params.runId, body);
      ok(res, { run });
    }
  ),
};
