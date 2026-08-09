import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { documents } from "@/db/schema/documents.ts";
import { chatAccess, roleName } from "@/db/schema/enums.ts";
import { users } from "@/db/schema/users.ts";

export const documentLinks = pgTable(
  "document_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    role: roleName("role").notNull().default("viewer"),
    chatAccess: chatAccess("chat_access").notNull().default("none"),
    label: text("label"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("document_links_doc_idx").on(table.documentId),
    check("links_are_not_admin", sql`${table.role} in ('viewer', 'editor')`),
  ]
);
