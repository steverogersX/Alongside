import { Router } from "express";

import { agentRoutes } from "@/modules/agents/agent.routes.ts";
import { authRoutes } from "@/modules/auth/auth.routes.ts";
import { connectionRoutes } from "@/modules/connections/connection.routes.ts";
import { mcpRoutes } from "@/modules/mcp/mcp.routes.ts";
import { documentRoutes } from "@/modules/documents/document.routes.ts";
import { linkRoutes } from "@/modules/links/link.routes.ts";
import { workspaceRoutes } from "@/modules/workspaces/workspace.routes.ts";
import { ok } from "@/shared/response.ts";

export const apiRoutes = Router();

apiRoutes.get("/health", (_req, res) => {
  ok(res, { status: "up" });
});

apiRoutes.use("/mcp", mcpRoutes);
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/connections", connectionRoutes);
apiRoutes.use("/workspaces", workspaceRoutes);
apiRoutes.use("/documents", documentRoutes);
apiRoutes.use("/agents", agentRoutes);
apiRoutes.use("/links", linkRoutes);
