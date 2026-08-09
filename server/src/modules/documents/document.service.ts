import type { Role, User } from "@/db/types.ts";
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

  role(role: Role | null) {
    if (!role) throw notFound("Document not found");
    return role;
  },
};
