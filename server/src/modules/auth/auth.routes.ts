import { Router } from "express";

import { requireUser } from "@/middleware/auth.ts";
import { validate } from "@/middleware/validate.ts";
import { authController } from "@/modules/auth/auth.controller.ts";
import { loginSchema, signupSchema } from "@/modules/auth/auth.schema.ts";

export const authRoutes = Router();

authRoutes.post(
  "/signup",
  validate({ body: signupSchema }),
  authController.signup
);

authRoutes.post("/login", validate({ body: loginSchema }), authController.login);

authRoutes.post("/logout", authController.logout);

authRoutes.get("/me", requireUser, authController.me);
