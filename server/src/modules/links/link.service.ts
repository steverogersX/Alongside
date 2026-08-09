import type { Response } from "express";

import type { DocumentLink, User } from "@/db/types.ts";
import { accessService } from "@/modules/access/access.service.ts";
import { toPublicLink } from "@/modules/links/link.mapper.ts";
import { linkRepository } from "@/modules/links/link.repository.ts";
import type { CreateLinkInput } from "@/modules/links/link.schema.ts";
import { hashToken, linkToken, mintToken } from "@/modules/links/link.token.ts";
import { forbidden, notFound } from "@/shared/errors.ts";

const isLive = (link: DocumentLink) =>
  !link.revokedAt && (!link.expiresAt || link.expiresAt > new Date());

export const linkService = {
  async list(user: User, documentId: string) {
    await accessService.requireDocumentRole(user, documentId, "editor");
    const links = await linkRepository.listForDocument(documentId);
    return links.map(toPublicLink);
  },

  async create(user: User, documentId: string, input: CreateLinkInput) {
    const role = await accessService.requireDocumentRole(
      user,
      documentId,
      "editor"
    );

    if (input.role === "editor" && role === "viewer") {
      throw forbidden("You cannot share edit access you do not have");
    }

    const token = mintToken();

    const link = await linkRepository.create({
      documentId,
      tokenHash: hashToken(token),
      role: input.role,
      label: input.label ?? null,
      expiresAt: input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 86_400_000)
        : null,
      createdBy: user.id,
    });

    return { link: toPublicLink(link), token };
  },

  async revoke(user: User, documentId: string, linkId: string) {
    await accessService.requireDocumentRole(user, documentId, "editor");

    const link = await linkRepository.revoke(linkId, documentId);
    if (!link) throw notFound("Link not found");

    return toPublicLink(link);
  },

  async redeem(token: string, res: Response) {
    const link = await linkRepository.findByTokenHash(hashToken(token));

    if (!link || !isLive(link)) throw notFound("This link is no longer valid");

    await linkToken.issue(
      { linkId: link.id, documentId: link.documentId, role: link.role },
      res
    );

    return { documentId: link.documentId, role: link.role };
  },

  async resolve(jwt: string) {
    const claims = await linkToken.verify(jwt);
    if (!claims) return null;

    const link = await linkRepository.findById(claims.linkId);
    if (!link || !isLive(link)) return null;
    if (link.documentId !== claims.documentId) return null;

    return { link, role: link.role, visitorId: claims.visitorId };
  },
};
