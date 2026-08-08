import type { Request } from "express";

import type { User } from "@/db/types.ts";
import { unauthorized } from "@/shared/errors.ts";

export function currentUser(req: Request): User {
  if (!req.user) throw unauthorized();
  return req.user;
}

export function param(req: Request, key: string): string {
  const value = req.params[key];
  if (typeof value !== "string") {
    throw new Error(`Route parameter "${key}" is not a string`);
  }
  return value;
}

export function body<T>(req: Request): T {
  return req.body as T;
}

export function query<T>(req: Request): T {
  return req.query as T;
}
