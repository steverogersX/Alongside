import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db, pool } from "@/db/client.ts";

/**
 * Deploy-time migration. drizzle-kit is a build tool and its config reaches
 * into src/, which is not deployed — so the runtime does this itself.
 */
const folder = process.env.MIGRATIONS_DIR ?? "server/drizzle";

await migrate(db, { migrationsFolder: folder });
console.log(`migrations applied from ${folder}`);

await pool.end();
