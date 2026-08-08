import { z } from "zod";

export const proseMirrorDocSchema = z.object({ type: z.literal("doc") }).loose();

export const updateDocumentSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    status: z.enum(["draft", "in_review", "final"]).optional(),
    content: proseMirrorDocSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Nothing to update",
  });

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
