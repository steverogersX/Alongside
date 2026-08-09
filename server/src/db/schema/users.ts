import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { userKind } from "@/db/schema/enums.ts";
import { orgs } from "@/db/schema/orgs.ts";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    kind: userKind("kind").notNull(),
    displayName: text("display_name").notNull(),
    avatarSeed: text("avatar_seed")
      .notNull()
      .default(sql`gen_random_uuid()::text`),
    isOrgAdmin: boolean("is_org_admin").notNull().default(false),

    email: text("email"),
    model: text("model"),
    provider: text("provider"),
    baseUrl: text("base_url"),
    keyCipher: text("key_cipher"),
    keyLast4: text("key_last4"),
    createdBy: uuid("created_by"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("users_org_email_key")
      .on(table.orgId, table.email)
      .where(sql`${table.email} is not null and ${table.deletedAt} is null`),
    index("users_org_kind_idx").on(table.orgId, table.kind),
    check(
      "humans_have_email",
      sql`(${table.kind} = 'human') = (${table.email} is not null)`
    ),
    check(
      "bots_have_model",
      sql`(${table.kind} = 'bot') = (${table.model} is not null)`
    ),
  ]
);

export const userIdentities = pgTable(
  "user_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("identities_provider_key").on(
      table.provider,
      table.providerUserId
    ),
    index("identities_user_idx").on(table.userId),
    check(
      "password_hash_iff_password",
      sql`(${table.provider} = 'password') = (${table.passwordHash} is not null)`
    ),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [index("sessions_user_idx").on(table.userId)]
);
