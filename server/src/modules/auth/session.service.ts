import type { Response } from "express";
import { and, eq, gt, isNull } from "drizzle-orm";

import { cookiePolicy } from "@/config/env.ts";
import { db } from "@/db/client.ts";
import { sessions, users } from "@/db/schema/index.ts";
import { SESSION_COOKIE, SESSION_DAYS } from "@/modules/auth/session.constants.ts";
import { tokenService } from "@/modules/auth/token.service.ts";

export const sessionService = {
  async issue(userId: string, res: Response, userAgent?: string) {
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

    const [session] = await db
      .insert(sessions)
      .values({ userId, userAgent: userAgent ?? null, expiresAt })
      .returning();

    const token = await tokenService.sign(
      { sub: userId, sid: session!.id },
      expiresAt
    );

    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: cookiePolicy.sameSite,
      secure: cookiePolicy.secure,
      expires: expiresAt,
      path: "/",
    });

    return token;
  },

  async resolve(token: string) {
    const claims = await tokenService.verify(token);
    if (!claims) return null;

    const [row] = await db
      .select({ session: sessions, user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.id, claims.sid),
          eq(sessions.userId, claims.sub),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date()),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    return row ?? null;
  },

  async revoke(token: string, res: Response) {
    const claims = await tokenService.verify(token);

    if (claims) {
      await db
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(eq(sessions.id, claims.sid));
    }

    res.clearCookie(SESSION_COOKIE, { path: "/" });
  },
};
