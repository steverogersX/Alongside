import { z } from "zod";

import { uuidSchema } from "@/shared/validation.ts";

export const startRunSchema = z.object({
  agentId: uuidSchema,
  prompt: z.string().trim().min(1).max(4000),
});

export const decideRunSchema = z.object({
  decision: z.enum(["accept", "discard"]),
});

export const runParams = z.object({
  id: uuidSchema,
  runId: uuidSchema,
});

export type StartRunInput = z.infer<typeof startRunSchema>;
export type DecideRunInput = z.infer<typeof decideRunSchema>;
