import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { badRequest } from "@/shared/errors.ts";

type Schemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const key of ["body", "params", "query"] as const) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);
      if (!result.success) {
        return next(
          badRequest(
            `Invalid ${key}`,
            result.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            }))
          )
        );
      }

      Object.defineProperty(req, key, { value: result.data, writable: true });
    }

    next();
  };
}
