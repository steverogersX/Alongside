import type { Request } from "express";

import type { ChatAccess, Role, User } from "@/db/types.ts";
import { accessRepository } from "@/modules/access/access.repository.ts";
import { createCache } from "@/shared/cache.ts";
import { forbidden, notFound } from "@/shared/errors.ts";
import { atLeast, highest, lower } from "@/shared/role.ts";

// Role lookups are the hottest read in the system — every request, every agent
// tool call, every socket upgrade. Grants change rarely, and when they do the
// cache is dropped outright rather than expired.
const roleCache = createCache<Role | null>({ ttlMs: 15_000, max: 5_000 });
const agentsCache = createCache<User[]>({ ttlMs: 15_000, max: 1_000 });

export function forgetAccess() {
  roleCache.clear();
  agentsCache.clear();
}

export const accessService = {
  async workspaceRole(user: User, workspaceId: string): Promise<Role | null> {
    return roleCache.wrap(`ws:${user.id}:${workspaceId}`, async () => {
      const workspace = await accessRepository.findWorkspace(workspaceId);
      if (!workspace || workspace.orgId !== user.orgId) return null;
      if (user.isOrgAdmin) return "admin";

      return highest(
        await accessRepository.rolesForWorkspace(user.id, workspaceId)
      );
    });
  },

  async documentRole(user: User, documentId: string): Promise<Role | null> {
    return roleCache.wrap(`doc:${user.id}:${documentId}`, async () => {
      const row = await accessRepository.findDocumentWithWorkspace(documentId);
      if (!row || row.workspace.orgId !== user.orgId) return null;
      if (user.isOrgAdmin) return "admin";

      return highest(
        await accessRepository.rolesForDocument(
          user.id,
          documentId,
          row.workspace.id
        )
      );
    });
  },

  async agentsForDocument(documentId: string) {
    return agentsCache.wrap(`agents:${documentId}`, () =>
      accessRepository.agentsForDocument(documentId)
    );
  },

  /**
   * Chat is a separate axis from editing: a reviewer who cannot touch the text
   * is often exactly who you want commenting, and a guest trusted to edit is
   * not automatically trusted to read the room's back-and-forth.
   */
  async contextAccess(
    req: Request,
    documentId: string
  ): Promise<{
    role: Role;
    chat: ChatAccess;
    via: "member" | "link";
  } | null> {
    if (req.user) {
      const role = await this.documentRole(req.user, documentId);
      if (!role) return null;

      return {
        role,
        chat: atLeast(role, "editor") ? "write" : "read",
        via: "member",
      };
    }

    if (req.link && req.link.documentId === documentId) {
      return {
        role: req.link.role,
        chat: req.link.chatAccess,
        via: "link",
      };
    }

    return null;
  },

  async requireWorkspaceRole(user: User, workspaceId: string, required: Role) {
    const role = await this.workspaceRole(user, workspaceId);
    if (!role) throw notFound("Workspace not found");
    if (!atLeast(role, required)) throw forbidden();
    return role;
  },

  async requireDocumentRole(user: User, documentId: string, required: Role) {
    const role = await this.documentRole(user, documentId);
    if (!role) throw notFound("Document not found");
    if (!atLeast(role, required)) throw forbidden();
    return role;
  },

  /**
   * A guest has no seat of their own — the link is their whole standing here,
   * so it caps the agent the same way an invoking member's role would.
   */
  async resolveLinkCeiling(
    agent: User,
    documentId: string,
    linkRole: Role
  ): Promise<Role | null> {
    const agentRole = await this.documentRole(agent, documentId);
    return agentRole ? lower(agentRole, linkRole) : null;
  },

  async resolveCeiling(
    agentId: string,
    invoker: User,
    documentId: string
  ): Promise<Role> {
    const agent = await accessRepository.findAgent(agentId, invoker.orgId);
    if (!agent) throw notFound("Agent not found");

    const agentRole = await this.documentRole(agent, documentId);
    if (!agentRole) throw forbidden("That agent has no seat in this workspace");

    const invokerRole = await this.documentRole(invoker, documentId);
    if (!invokerRole) throw notFound("Document not found");

    return lower(agentRole, invokerRole);
  },
};
