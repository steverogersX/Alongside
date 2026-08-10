import { SignJWT, jwtVerify } from "jose";

import { env } from "@/config/env.ts";
import type { Role } from "@/db/types.ts";
import type { CollabIdentity } from "@/modules/collab/collab.identity.ts";

const secret = new TextEncoder().encode(env.SESSION_SECRET);
const ISSUER = "alongside";
const AUDIENCE = "alongside-collab";

/**
 * Short-lived, because it travels in a URL: query strings end up in proxy logs
 * and browser history in a way cookies do not. Long enough to open a socket,
 * not long enough to be worth stealing.
 */
const LIFETIME_SECONDS = 120;

/**
 * The socket carries its own proof of identity rather than relying on a cookie.
 * The editor is served from one host and the collaboration server from another,
 * and a browser will not send a cookie across that boundary once third-party
 * cookies are blocked — which they are by default in private windows.
 */
export const collabToken = {
  async issue(identity: CollabIdentity, documentId: string) {
    return new SignJWT({
      documentId,
      name: identity.name,
      avatarSeed: identity.avatarSeed,
      color: identity.color,
      kind: identity.kind,
      role: identity.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(identity.key)
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + LIFETIME_SECONDS)
      .sign(secret);
  },

  async verify(
    jwt: string,
    documentId: string
  ): Promise<CollabIdentity | null> {
    try {
      const { payload } = await jwtVerify(jwt, secret, {
        issuer: ISSUER,
        audience: AUDIENCE,
      });

      if (payload.documentId !== documentId) return null;

      const { sub, name, avatarSeed, color, kind, role } = payload;

      if (
        typeof sub !== "string" ||
        typeof name !== "string" ||
        typeof avatarSeed !== "string" ||
        typeof color !== "string" ||
        (kind !== "member" && kind !== "guest" && kind !== "agent") ||
        (role !== "viewer" && role !== "editor" && role !== "admin")
      ) {
        return null;
      }

      return {
        key: sub,
        name,
        avatarSeed,
        color,
        kind,
        role: role as Role,
      };
    } catch {
      return null;
    }
  },
};
