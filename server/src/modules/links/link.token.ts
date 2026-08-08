import { createHash, randomBytes } from "node:crypto";
import type { Response } from "express";
import { SignJWT, jwtVerify } from "jose";

import { env, isProd } from "@/config/env.ts";
import type { Role } from "@/db/types.ts";
import {
  LINK_COOKIE,
  LINK_SESSION_HOURS,
} from "@/modules/links/link.constants.ts";

const secret = new TextEncoder().encode(env.SESSION_SECRET);
const ISSUER = "alongside";
const AUDIENCE = "alongside-link";

export type LinkClaims = {
  linkId: string;
  documentId: string;
  role: Role;
};

export const mintToken = () => randomBytes(32).toString("base64url");

export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const linkToken = {
  async issue(claims: LinkClaims, res: Response) {
    const expiresAt = new Date(Date.now() + LINK_SESSION_HOURS * 3_600_000);

    const jwt = await new SignJWT({
      documentId: claims.documentId,
      role: claims.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(claims.linkId)
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(secret);

    res.cookie(LINK_COOKIE, jwt, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      expires: expiresAt,
      path: "/",
    });
  },

  async verify(jwt: string): Promise<LinkClaims | null> {
    try {
      const { payload } = await jwtVerify(jwt, secret, {
        issuer: ISSUER,
        audience: AUDIENCE,
      });

      if (
        typeof payload.sub !== "string" ||
        typeof payload.documentId !== "string" ||
        (payload.role !== "viewer" && payload.role !== "editor")
      ) {
        return null;
      }

      return {
        linkId: payload.sub,
        documentId: payload.documentId,
        role: payload.role,
      };
    } catch {
      return null;
    }
  },

  clear(res: Response) {
    res.clearCookie(LINK_COOKIE, { path: "/" });
  },
};
