import { z } from "zod";

import { uuidSchema } from "@/shared/validation.ts";

export const createLinkSchema = z.object({
  role: z.enum(["viewer", "editor"]).default("viewer"),
  chatAccess: z.enum(["none", "read", "write"]).default("none"),
  label: z.string().trim().min(1).max(80).optional(),
  expiresInDays: z.coerce.number().int().min(1).max(365).optional(),
});

export const linkParams = z.object({
  id: uuidSchema,
  linkId: uuidSchema,
});

export const tokenParams = z.object({
  token: z
    .string()
    .trim()
    .min(20)
    .max(120)
    .regex(/^[A-Za-z0-9_-]+$/, "Malformed link"),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
