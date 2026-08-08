import type { Request, Response } from "express";

import { runService } from "@/modules/runs/run.service.ts";
import type {
  DecideRunInput,
  StartRunInput,
} from "@/modules/runs/run.schema.ts";
import { body, currentUser, param } from "@/shared/request.ts";
import { accepted, ok } from "@/shared/response.ts";

export const runController = {
  async list(req: Request, res: Response) {
    const runs = await runService.list(currentUser(req), param(req, "id"));
    ok(res, { runs }, { count: runs.length });
  },

  async start(req: Request, res: Response) {
    const run = await runService.start(
      currentUser(req),
      param(req, "id"),
      body<StartRunInput>(req)
    );
    accepted(res, { run });
  },

  async decide(req: Request, res: Response) {
    const run = await runService.decide(
      currentUser(req),
      param(req, "id"),
      param(req, "runId"),
      body<DecideRunInput>(req)
    );
    ok(res, { run });
  },
};
