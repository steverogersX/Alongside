import type { User } from "@/db/types.ts";
import { accessService } from "@/modules/access/access.service.ts";
import { documentRepository } from "@/modules/documents/document.repository.ts";
import type { UpdateDocumentInput } from "@/modules/documents/document.schema.ts";
import { notFound } from "@/shared/errors.ts";

export const documentService = {
  async get(user: User, documentId: string) {
    const role = await accessService.requireDocumentRole(
      user,
      documentId,
      "viewer"
    );

    const document = await documentRepository.findById(documentId);
    if (!document) throw notFound("Document not found");

    return { document, role };
  },

  async update(user: User, documentId: string, patch: UpdateDocumentInput) {
    await accessService.requireDocumentRole(user, documentId, "editor");
    return documentRepository.update(documentId, patch);
  },

  async role(user: User, documentId: string) {
    const role = await accessService.documentRole(user, documentId);
    if (!role) throw notFound("Document not found");
    return role;
  },
};
