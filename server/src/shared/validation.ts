import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(10).max(200);
export const displayNameSchema = z.string().trim().min(1).max(80);
export const roleSchema = z.enum(["viewer", "editor", "admin"]);

export const idParams = z.object({ id: uuidSchema });

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 38);
