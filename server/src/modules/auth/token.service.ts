import { SignJWT, jwtVerify } from "jose";

import { env } from "@/config/env.ts";
import { SESSION_DAYS } from "@/modules/auth/session.constants.ts";

const secret = new TextEncoder().encode(env.SESSION_SECRET);
const ISSUER = "alongside";
const AUDIENCE = "alongside-app";

export type TokenClaims = {
  sub: string;
  sid: string;
};

export const tokenService = {
  async sign(claims: TokenClaims, expiresAt: Date) {
    return new SignJWT({ sid: claims.sid })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(claims.sub)
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(secret);
  },

  async verify(token: string): Promise<TokenClaims | null> {
    try {
      const { payload } = await jwtVerify(token, secret, {
        issuer: ISSUER,
        audience: AUDIENCE,
        maxTokenAge: `${SESSION_DAYS}d`,
      });

      if (typeof payload.sub !== "string" || typeof payload.sid !== "string") {
        return null;
      }

      return { sub: payload.sub, sid: payload.sid };
    } catch {
      return null;
    }
  },
};
