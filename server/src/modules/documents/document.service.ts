import type { PublicUser, Role, User } from "@/db/types.ts";
import { accessService, forgetAccess } from "@/modules/access/access.service.ts";
import { toPublicUser } from "@/modules/auth/auth.mapper.ts";
import { closeDocument } from "@/modules/collab/collab.events.ts";
import { documentRepository } from "@/modules/documents/document.repository.ts";
import type { UpdateDocumentInput } from "@/modules/documents/document.schema.ts";
import { forbidden, notFound } from "@/shared/errors.ts";
import { atLeast } from "@/shared/role.ts";

export type Access = { role: Role; via: "member" | "link" };

export const documentService = {
  async recent(user: User, limit: number) {
    const rows = await documentRepository.listRecent(user, limit);

    return rows.map(({ document, workspace }) => ({
      id: document.id,
      title: document.title,
      status: document.status,
      updatedAt: document.updatedAt,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
    }));
  },

  async get(documentId: string, access: Access | null) {
    if (!access) throw notFound("Document not found");

    const document = await documentRepository.findById(documentId);
    if (!document) throw notFound("Document not found");

    return { document, role: access.role, via: access.via };
  },

  async update(
    documentId: string,
    role: Role | null,
    patch: UpdateDocumentInput
  ) {
    if (!role) throw notFound("Document not found");
    if (!atLeast(role, "editor")) throw forbidden();

    return documentRepository.update(documentId, patch);
  },

  /**
   * Which agents can be summoned here, for anyone who can reach the document —
   * a guest typing @ has to be offered the same names a member would be.
   */
  async agents(documentId: string, access: Access | null) {
    if (!access) throw notFound("Document not found");

    const agents = await accessService.agentsForDocument(documentId);

    const rows = await Promise.all(
      agents.map(async (agent) => ({
        agent: toPublicUser(agent),
        role: await accessService.documentRole(agent, documentId),
      }))
    );

    return rows.filter(
      (row): row is { agent: PublicUser; role: Role } => row.role !== null
    );
  },

  /**
   * Deleting is an owner's decision, not an editor's — a link guest handed
   * edit rights should never be able to take the document away.
   */
  async remove(user: User, documentId: string) {
    await accessService.requireDocumentRole(user, documentId, "admin");

    const document = await documentRepository.remove(documentId);
    if (!document) throw notFound("Document not found");

    closeDocument(documentId);
    forgetAccess();

    return document;
  },

  role(role: Role | null) {
    if (!role) throw notFound("Document not found");
    return role;
  },
};
