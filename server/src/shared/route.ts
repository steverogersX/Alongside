import type { Request, RequestHandler, Response } from "express";
import type { ZodType, z } from "zod";

import type { User } from "@/db/types.ts";
import { badRequest, unauthorized } from "@/shared/errors.ts";

type Slot = ZodType | undefined;

type Schemas = {
  params?: Slot;
  body?: Slot;
  query?: Slot;
};

type Parsed<T extends Slot> = T extends ZodType ? z.infer<T> : undefined;

type Context<S extends Schemas, U> = {
  params: Parsed<S["params"]>;
  body: Parsed<S["body"]>;
  query: Parsed<S["query"]>;
  user: U;
  req: Request;
  res: Response;
};

function parse<S extends Schemas>(schemas: S, req: Request) {
  const out: Record<string, unknown> = {};

  for (const slot of ["params", "body", "query"] as const) {
    const schema = schemas[slot];
    if (!schema) continue;

    // Express 5 leaves req.body undefined for a request that carries no body,
    // so a POST that legitimately sends nothing would fail an object schema.
    const value = slot === "body" ? (req.body ?? {}) : req[slot];

    const result = schema.safeParse(value);
    if (!result.success) {
      throw badRequest(
        `Invalid ${slot}`,
        result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }))
      );
    }

    out[slot] = result.data;
  }

  return out as Pick<Context<S, never>, "params" | "body" | "query">;
}

export function route<S extends Schemas>(
  schemas: S,
  handler: (ctx: Context<S, User>) => unknown
): RequestHandler {
  return async (req, res) => {
    if (!req.user) throw unauthorized();
    await handler({ ...parse(schemas, req), user: req.user, req, res });
  };
}

export function publicRoute<S extends Schemas>(
  schemas: S,
  handler: (ctx: Context<S, User | null>) => unknown
): RequestHandler {
  return async (req, res) => {
    await handler({ ...parse(schemas, req), user: req.user ?? null, req, res });
  };
}
