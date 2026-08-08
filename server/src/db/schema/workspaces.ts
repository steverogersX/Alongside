import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { orgs } from "@/db/schema/orgs.ts";
import { users } from "@/db/schema/users.ts";

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    purpose: text("purpose"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("workspaces_org_idx").on(table.orgId)]
);
