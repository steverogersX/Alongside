import { db } from "@/db/client.ts";
import type { Document, User } from "@/db/types.ts";
import { accessService } from "@/modules/access/access.service.ts";
import { chatRepository } from "@/modules/chat/chat.repository.ts";
import { documentRepository } from "@/modules/documents/document.repository.ts";
import { runRepository } from "@/modules/runs/run.repository.ts";
import type {
  DecideRunInput,
  StartRunInput,
} from "@/modules/runs/run.schema.ts";
import { badRequest, notFound } from "@/shared/errors.ts";
import { atLeast } from "@/shared/role.ts";
import type { PaginationQuery } from "@/shared/validation.ts";

export const runService = {
  async list(user: User, documentId: string, page: PaginationQuery) {
    await accessService.requireDocumentRole(user, documentId, "viewer");
    return runRepository.listForDocument(documentId, page.limit, page.offset);
  },

  async start(user: User, documentId: string, input: StartRunInput) {
    await accessService.requireDocumentRole(user, documentId, "viewer");

    const ceiling = await accessService.resolveCeiling(
      input.agentId,
      user,
      documentId
    );

    return db.transaction(async (tx) => {
      const run = await runRepository.create(tx, {
        documentId,
        agentId: input.agentId,
        invokedBy: user.id,
        prompt: input.prompt,
        ceiling,
      });

      await chatRepository.create(
        { documentId, authorId: user.id, body: input.prompt, runId: run.id },
        tx
      );

      return run;
    });
  },

  async decide(
    user: User,
    documentId: string,
    runId: string,
    input: DecideRunInput
  ) {
    await accessService.requireDocumentRole(user, documentId, "editor");

    const run = await runRepository.findForDocument(runId, documentId);
    if (!run) throw notFound("Run not found");
    if (run.status !== "proposed") throw badRequest("That run has nothing to accept");

    return db.transaction(async (tx) => {
      if (input.decision === "accept") {
        if (!run.proposal) throw badRequest("That run has no proposal");
        if (!atLeast(run.ceiling, "editor")) {
          throw badRequest("That run was not authorised to change the document");
        }

        await documentRepository.update(
          documentId,
          { content: run.proposal as Document["content"] },
          tx
        );
      }

      return runRepository.settle(tx, run.id, {
        status: input.decision === "accept" ? "accepted" : "discarded",
        decidedBy: user.id,
      });
    });
  },
};
