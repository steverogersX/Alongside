import { accessService } from "@/modules/access/access.service.ts";
import { runService } from "@/modules/runs/run.service.ts";
import {
  decideRunSchema,
  runParams,
  startRunSchema,
} from "@/modules/runs/run.schema.ts";
import { accepted, ok } from "@/shared/response.ts";
import { publicRoute, route } from "@/shared/route.ts";
import {
  idParams,
  noBody,
  noQuery,
  paginationQuery,
} from "@/shared/validation.ts";

export const runController = {
  /**
   * A guest who can start a run has to be able to watch it, so this one reads
   * from the link session too — starting, stopping and deciding do not.
   */
  list: publicRoute(
    { params: idParams, query: paginationQuery },
    async ({ params, query, req, res }) => {
      const access = await accessService.contextAccess(req, params.id);
      const runs = await runService.list(access, params.id, query);
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

  cancel: route(
    { params: runParams, body: noBody, query: noQuery },
    async ({ params, user, res }) => {
      const run = await runService.cancel(user, params.id, params.runId);
      ok(res, { run });
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
