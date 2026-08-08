import { z } from "zod";

import { displayNameSchema } from "@/shared/validation.ts";

export const createAgentSchema = z.object({
  displayName: displayNameSchema,
  model: z.string().trim().min(1).max(80),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
