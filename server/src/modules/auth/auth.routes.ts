import { Router } from "express";

import { requireUser } from "@/middleware/auth.ts";
import { authController } from "@/modules/auth/auth.controller.ts";

export const authRoutes = Router();

authRoutes.post("/signup", authController.signup);
authRoutes.post("/login", authController.login);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", requireUser, authController.me);
