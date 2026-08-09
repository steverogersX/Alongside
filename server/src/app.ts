import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { corsOrigins } from "@/config/env.ts";
import { attachUser } from "@/middleware/auth.ts";
import { attachLink } from "@/middleware/link.ts";
import { errorHandler, notFoundHandler } from "@/middleware/error.ts";
import { apiRoutes } from "@/routes.ts";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use(attachUser);
  app.use(attachLink);

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
