import { z } from "zod";

import { PROVIDERS } from "@/modules/providers/index.ts";
import { displayNameSchema } from "@/shared/validation.ts";

export const createAgentSchema = z.object({
  displayName: displayNameSchema,
  model: z.string().trim().min(1).max(80),
  provider: z.enum(PROVIDERS),
  apiKey: z.string().trim().min(8).max(400),
  baseUrl: z.url().max(200).optional(),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
