import type { DocumentLink } from "@/db/types.ts";

export type PublicLink = Omit<DocumentLink, "tokenHash">;

export function toPublicLink(link: DocumentLink): PublicLink {
  const { tokenHash: _tokenHash, ...rest } = link;
  return rest;
}
