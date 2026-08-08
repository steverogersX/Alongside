import type { User } from "@/db/types.ts";
import { accessService } from "@/modules/access/access.service.ts";
import { toPublicUser } from "@/modules/auth/auth.mapper.ts";
import { chatRepository } from "@/modules/chat/chat.repository.ts";
import type { PostMessageInput } from "@/modules/chat/chat.schema.ts";

export const chatService = {
  async list(user: User, documentId: string) {
    await accessService.requireDocumentRole(user, documentId, "viewer");

    const rows = await chatRepository.listForDocument(documentId);

    return rows.map((row) => ({
      ...row.message,
      author: toPublicUser(row.author),
    }));
  },

  async post(user: User, documentId: string, input: PostMessageInput) {
    await accessService.requireDocumentRole(user, documentId, "viewer");

    const message = await chatRepository.create({
      documentId,
      authorId: user.id,
      body: input.body,
    });

    return { ...message, author: toPublicUser(user) };
  },
};
