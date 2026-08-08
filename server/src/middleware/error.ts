import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

import { AppError } from "@/shared/errors.ts";
import { fail } from "@/shared/response.ts";

export function notFoundHandler(_req: Request, res: Response) {
  fail(res, 404, { code: "not_found", message: "Not found" });
}

export function errorHandler(
  error: unknown,
  req: Request,
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

  const errorId = randomUUID();

  console.error(`[${errorId}] ${req.method} ${req.originalUrl}`, error);

  fail(res, 500, {
    code: "internal_error",
    message: "Something went wrong on our end",
    details: { errorId },
  });
}
