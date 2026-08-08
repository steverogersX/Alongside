import { z } from "zod";

import { roleSchema, uuidSchema } from "@/shared/validation.ts";

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(80),
  purpose: z.string().trim().max(300).optional(),
});

export const addMemberSchema = z.object({
  userId: uuidSchema,
  role: roleSchema,
});

export const memberParams = z.object({
  id: uuidSchema,
  userId: uuidSchema,
});

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
