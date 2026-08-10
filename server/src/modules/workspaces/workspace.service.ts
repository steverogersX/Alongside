import { db } from "@/db/client.ts";
import type { User } from "@/db/types.ts";
import {
  accessService,
  forgetAccess,
} from "@/modules/access/access.service.ts";
import { toPublicUser } from "@/modules/auth/auth.mapper.ts";
import { closeDocument } from "@/modules/collab/collab.events.ts";
import { workspaceRepository } from "@/modules/workspaces/workspace.repository.ts";
import type {
  AddMemberInput,
  CreateDocumentInput,
  CreateWorkspaceInput,
} from "@/modules/workspaces/workspace.schema.ts";
import { badRequest, notFound } from "@/shared/errors.ts";

export const workspaceService = {
  async list(user: User) {
    return user.isOrgAdmin
      ? workspaceRepository.listForOrg(user.orgId)
      : workspaceRepository.listForUser(user.id, user.orgId);
  },

  async create(user: User, input: CreateWorkspaceInput) {
    return db.transaction(async (tx) => {
      const workspace = await workspaceRepository.create(tx, {
        orgId: user.orgId,
        name: input.name,
        purpose: input.purpose ?? null,
        createdBy: user.id,
      });

      await workspaceRepository.upsertGrant(
        {
          userId: user.id,
          workspaceId: workspace.id,
          role: "admin",
          grantedBy: user.id,
        },
        tx
      );

      return workspace;
    });
  },

  async detail(user: User, workspaceId: string) {
    const role = await accessService.workspaceRole(user, workspaceId);
    if (!role) throw notFound("Workspace not found");

    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw notFound("Workspace not found");

    const [members, documents] = await Promise.all([
      workspaceRepository.listMembers(workspaceId),
      workspaceRepository.listDocuments(workspaceId),
    ]);

    return {
      workspace,
      role,
      members: members.map((row) => ({
        user: toPublicUser(row.user),
        role: row.role,
      })),
      documents,
    };
  },

  /**
   * Only a workspace admin can take a whole workspace — and every document in
   * it — away. The rooms are closed before the rows go so nobody is left
   * editing into a document that no longer exists.
   */
  async remove(user: User, workspaceId: string) {
    await accessService.requireWorkspaceRole(user, workspaceId, "admin");

    const documentIds = await workspaceRepository.listDocumentIds(workspaceId);

    const workspace = await workspaceRepository.remove(workspaceId);
    if (!workspace) throw notFound("Workspace not found");

    for (const documentId of documentIds) closeDocument(documentId);
    forgetAccess();

    return workspace;
  },

  async agents(user: User, workspaceId: string) {
    const role = await accessService.workspaceRole(user, workspaceId);
    if (!role) throw notFound("Workspace not found");

    const rows = await workspaceRepository.listAgents(workspaceId);

    return rows.map((row) => ({
      agent: toPublicUser(row.agent),
      role: row.role,
    }));
  },

  async addMember(user: User, workspaceId: string, input: AddMemberInput) {
    await accessService.requireWorkspaceRole(user, workspaceId, "admin");

    const target = await workspaceRepository.findOrgUser(
      input.userId,
      user.orgId
    );
    if (!target) throw notFound("User not found");
    if (target.kind === "bot" && input.role === "admin") {
      throw badRequest("Agents cannot be workspace admins");
    }

    const grant = await workspaceRepository.upsertGrant({
      userId: target.id,
      workspaceId,
      role: input.role,
      grantedBy: user.id,
    });

    forgetAccess();

    return grant;
  },

  async removeMember(user: User, workspaceId: string, memberId: string) {
    await accessService.requireWorkspaceRole(user, workspaceId, "admin");
    await workspaceRepository.removeGrant(workspaceId, memberId);
    forgetAccess();
  },

  async createDocument(
    user: User,
    workspaceId: string,
    input: CreateDocumentInput
  ) {
    await accessService.requireWorkspaceRole(user, workspaceId, "editor");

    return workspaceRepository.createDocument({
      workspaceId,
      title: input.title,
      createdBy: user.id,
    });
  },
};
