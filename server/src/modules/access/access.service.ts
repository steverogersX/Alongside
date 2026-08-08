import type { Role, User } from "@/db/types.ts";
import { accessRepository } from "@/modules/access/access.repository.ts";
import { forbidden, notFound } from "@/shared/errors.ts";
import { atLeast, highest, lower } from "@/shared/role.ts";

export const accessService = {
  async workspaceRole(user: User, workspaceId: string): Promise<Role | null> {
    const workspace = await accessRepository.findWorkspace(workspaceId);
    if (!workspace || workspace.orgId !== user.orgId) return null;
    if (user.isOrgAdmin) return "admin";

    return highest(await accessRepository.rolesForWorkspace(user.id, workspaceId));
  },

  async documentRole(user: User, documentId: string): Promise<Role | null> {
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
