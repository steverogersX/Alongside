import { z } from "zod";

import {
  displayNameSchema,
  emailSchema,
  loginPasswordSchema,
  passwordSchema,
} from "@/shared/validation.ts";

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  orgName: z.string().trim().min(1).max(80),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
