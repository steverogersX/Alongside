import { z } from "zod";

import { apiPost } from "@/lib/api";

export const signupSchema = z.object({
  displayName: z.string().trim().min(1, "Tell us what to call you").max(80),
  orgName: z.string().trim().min(1, "Name your organisation").max(80),
  email: z.string().trim().toLowerCase().max(254).email("That isn't a valid email"),
  password: z
    .string()
    .min(10, "Use at least 10 characters")
    .max(200, "That's too long"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email("That isn't a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export type SignupValues = z.infer<typeof signupSchema>;
export type LoginValues = z.infer<typeof loginSchema>;

export type SessionUser = {
  id: string;
  orgId: string;
  kind: "human" | "bot";
  displayName: string;
  avatarSeed: string;
  isOrgAdmin: boolean;
  email: string | null;
  model: string | null;
};

export const signup = (values: SignupValues) =>
  apiPost<{ user: SessionUser }>("/auth/signup", values);

export const login = (values: LoginValues) =>
  apiPost<{ user: SessionUser }>("/auth/login", values);

export const logout = () => apiPost<{ loggedOut: boolean }>("/auth/logout", {});
