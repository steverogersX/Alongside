import { Router } from "express";

import { mcpController } from "@/modules/mcp/mcp.controller.ts";

export const mcpRoutes = Router();

mcpRoutes.post("/", mcpController);
