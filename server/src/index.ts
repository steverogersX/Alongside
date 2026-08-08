import { createApp } from "@/app.ts";
import { env } from "@/config/env.ts";
import { pool } from "@/db/client.ts";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`api listening on http://localhost:${env.PORT}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received, closing`);
  server.close(() => {
    void pool.end().then(() => process.exit(0));
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
