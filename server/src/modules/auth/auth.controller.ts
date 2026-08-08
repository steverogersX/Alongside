import { toPublicUser } from "@/modules/auth/auth.mapper.ts";
import { loginSchema, signupSchema } from "@/modules/auth/auth.schema.ts";
import { authService } from "@/modules/auth/auth.service.ts";
import { sessionService } from "@/modules/auth/session.service.ts";
import { created, ok } from "@/shared/response.ts";
import { publicRoute, route } from "@/shared/route.ts";
import { noBody, noQuery } from "@/shared/validation.ts";

export const authController = {
  signup: publicRoute(
    { body: signupSchema, query: noQuery },
    async ({ body, req, res }) => {
      const user = await authService.signup(body);
      await sessionService.issue(
        user.id,
        res,
        req.get("user-agent") ?? undefined
      );
      created(res, { user: toPublicUser(user) });
    }
  ),

  login: publicRoute(
    { body: loginSchema, query: noQuery },
    async ({ body, req, res }) => {
      const user = await authService.login(body);
      await sessionService.issue(
        user.id,
        res,
        req.get("user-agent") ?? undefined
      );
      ok(res, { user: toPublicUser(user) });
    }
  ),

  logout: publicRoute(
    { body: noBody, query: noQuery },
    async ({ req, res }) => {
      if (req.sessionToken) await sessionService.revoke(req.sessionToken, res);
      ok(res, { loggedOut: true });
    }
  ),

  me: route({ query: noQuery }, ({ user, res }) => {
    ok(res, { user: toPublicUser(user) });
  }),
};
