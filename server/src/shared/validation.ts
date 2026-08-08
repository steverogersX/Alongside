import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(10).max(200);
export const loginPasswordSchema = z.string().min(1).max(200);
export const displayNameSchema = z.string().trim().min(1).max(80);
export const roleSchema = z.enum(["viewer", "editor", "admin"]);

export const idParams = z.object({ id: uuidSchema });
export const noParams = z.object({}).strict();
export const noBody = z.object({}).loose();
export const noQuery = z.object({}).strict();

export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type PaginationQuery = z.infer<typeof paginationQuery>;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 38);
