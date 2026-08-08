import type { Request, Response } from "express";

import { toPublicUser } from "@/modules/auth/auth.mapper.ts";
import type { LoginInput, SignupInput } from "@/modules/auth/auth.schema.ts";
import { authService } from "@/modules/auth/auth.service.ts";
import { sessionService } from "@/modules/auth/session.service.ts";
import { body, currentUser } from "@/shared/request.ts";
import { created, ok } from "@/shared/response.ts";

export const authController = {
  async signup(req: Request, res: Response) {
    const user = await authService.signup(body<SignupInput>(req));
    await sessionService.issue(user.id, res, req.get("user-agent") ?? undefined);
    created(res, { user: toPublicUser(user) });
  },

  async login(req: Request, res: Response) {
    const user = await authService.login(body<LoginInput>(req));
    await sessionService.issue(user.id, res, req.get("user-agent") ?? undefined);
    ok(res, { user: toPublicUser(user) });
  },

  async logout(req: Request, res: Response) {
    if (req.sessionToken) await sessionService.revoke(req.sessionToken, res);
    ok(res, { loggedOut: true });
  },

  async me(req: Request, res: Response) {
    ok(res, { user: toPublicUser(currentUser(req)) });
  },
};
