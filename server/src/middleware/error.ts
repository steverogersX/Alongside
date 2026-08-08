import type { NextFunction, Request, Response } from "express";

import { isProd } from "@/config/env.ts";
import { AppError } from "@/shared/errors.ts";
import { fail } from "@/shared/response.ts";

export function notFoundHandler(_req: Request, res: Response) {
  fail(res, 404, { code: "not_found", message: "Not found" });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    fail(res, error.status, {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  console.error(error);

  fail(res, 500, {
    code: "internal_error",
    message: isProd
      ? "Something went wrong"
      : error instanceof Error
        ? error.message
        : String(error),
  });
}
