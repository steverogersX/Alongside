import type { NextFunction, Request, Response } from "express";

import type { User } from "@/db/types.ts";
import { forbidden, unauthorized } from "@/shared/errors.ts";
import { SESSION_COOKIE } from "@/modules/auth/session.constants.ts";
import { sessionService } from "@/modules/auth/session.service.ts";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionToken?: string;
    }
  }
}

export async function attachUser(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;

  if (token) {
    const resolved = await sessionService.resolve(token);
    if (resolved) {
      req.user = resolved.user;
      req.sessionToken = token;
    }
  }

  next();
}

export function requireUser(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(unauthorized());
  next();
}

export function requireOrgAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user) return next(unauthorized());
  if (!req.user.isOrgAdmin) return next(forbidden("Org admins only"));
  next();
}
