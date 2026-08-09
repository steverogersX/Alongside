import { z } from "zod";

export const heartbeatSchema = z.object({
  activity: z.enum(["viewing", "editing"]).default("viewing"),
});

export type HeartbeatInput = z.infer<typeof heartbeatSchema>;
