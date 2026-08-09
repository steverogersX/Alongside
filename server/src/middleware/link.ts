import type { NextFunction, Request, Response } from "express";

import type { Role } from "@/db/types.ts";
import { LINK_COOKIE } from "@/modules/links/link.constants.ts";
import { linkService } from "@/modules/links/link.service.ts";

declare global {
  namespace Express {
    interface Request {
      link?: {
        linkId: string;
        documentId: string;
        role: Role;
        visitorId: string;
      };
    }
  }
}

export async function attachLink(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const jwt = req.cookies?.[LINK_COOKIE] as string | undefined;

  if (jwt) {
    const resolved = await linkService.resolve(jwt);
    if (resolved) {
      req.link = {
        linkId: resolved.link.id,
        documentId: resolved.link.documentId,
        role: resolved.role,
        visitorId: resolved.visitorId,
      };
    }
  }

  next();
}
