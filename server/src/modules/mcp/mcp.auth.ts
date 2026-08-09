import type { Request } from "express";

import type { AgentConnection, User } from "@/db/types.ts";
import { connectionRepository } from "@/modules/connections/connection.repository.ts";
import { connectionService } from "@/modules/connections/connection.service.ts";

export type McpIdentity = {
  connection: AgentConnection;
  agent: User;
  user: User;
};

export async function identify(req: Request): Promise<McpIdentity | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  const identity = await connectionService.resolve(header.slice(7).trim());
  if (!identity) return null;

  void connectionRepository.touch(identity.connection.id);

  return identity;
}

export function inScope(identity: McpIdentity, workspaceId: string) {
  const scope = identity.connection.workspaceIds;
  return scope === null || scope.includes(workspaceId);
}
