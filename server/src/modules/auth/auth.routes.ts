import { Router } from "express";

import { requireUser } from "@/middleware/auth.ts";
import { validate } from "@/middleware/validate.ts";
import { authController } from "@/modules/auth/auth.controller.ts";
import { loginSchema, signupSchema } from "@/modules/auth/auth.schema.ts";
import { noBody, noQuery } from "@/shared/validation.ts";

export const authRoutes = Router();

authRoutes.post(
  "/signup",
  validate({ body: signupSchema, query: noQuery }),
  authController.signup
);

authRoutes.post(
  "/login",
  validate({ body: loginSchema, query: noQuery }),
  authController.login
);

authRoutes.post(
  "/logout",
  validate({ body: noBody, query: noQuery }),
  authController.logout
);

authRoutes.get(
  "/me",
  requireUser,
  validate({ query: noQuery }),
  authController.me
);
