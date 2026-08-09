import { z } from "zod";

import { uuidSchema } from "@/shared/validation.ts";

export const createConnectionSchema = z.object({
  label: z.string().trim().min(1).max(60),
  agentId: uuidSchema,
  workspaceIds: z.array(uuidSchema).min(1).optional(),
});

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;
