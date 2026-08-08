import { createHash, randomBytes } from "node:crypto";
import type { Response } from "express";
import { and, eq, gt, isNull } from "drizzle-orm";

import { isProd } from "@/config/env.ts";
import { db } from "@/db/client.ts";
import { sessions, users } from "@/db/schema/index.ts";
import { SESSION_COOKIE, SESSION_DAYS } from "@/modules/auth/session.constants.ts";

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const sessionService = {
  async issue(userId: string, res: Response, userAgent?: string) {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

    await db.insert(sessions).values({
      userId,
      tokenHash: hashToken(token),
      userAgent: userAgent ?? null,
      expiresAt,
    });

    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      expires: expiresAt,
      path: "/",
    });
  },

  async resolve(token: string) {
    const [row] = await db
      .select({ session: sessions, user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.tokenHash, hashToken(token)),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date()),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    return row ?? null;
  },

  async revoke(token: string, res: Response) {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.tokenHash, hashToken(token)));

    res.clearCookie(SESSION_COOKIE, { path: "/" });
  },
};
