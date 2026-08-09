import { pgEnum } from "drizzle-orm/pg-core";

export const userKind = pgEnum("user_kind", ["human", "bot"]);
export const roleName = pgEnum("role_name", ["viewer", "editor", "admin"]);
export const chatAccess = pgEnum("chat_access", ["none", "read", "write"]);
export const docStatus = pgEnum("doc_status", ["draft", "in_review", "final"]);
export const runStatus = pgEnum("run_status", [
  "running",
  "proposed",
  "accepted",
  "discarded",
  "failed",
  "queued",
  "succeeded",
  "cancelled",
]);
