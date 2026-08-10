import type { Request } from "express";
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator";

import { accessService } from "@/modules/access/access.service.ts";
import { identityFor } from "@/modules/collab/collab.identity.ts";
import { collabToken } from "@/modules/collab/collab.token.ts";
import type { HeartbeatInput } from "@/modules/presence/presence.schema.ts";
import {
  presenceStore,
  type PresenceEntry,
} from "@/modules/presence/presence.store.ts";
import { notFound } from "@/shared/errors.ts";
import { atLeast } from "@/shared/role.ts";

const guestName = (seed: string) =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: " ",
    style: "capital",
    seed,
  });

function identify(
  req: Request,
  documentId: string
): Omit<PresenceEntry, "activity" | "lastSeen"> | null {
  if (req.user) {
    return {
      key: `user:${req.user.id}`,
      name: req.user.displayName,
      avatarSeed: req.user.avatarSeed,
      kind: req.user.kind === "bot" ? "agent" : "member",
    };
  }

  if (req.link && req.link.documentId === documentId) {
    const seed = `${documentId}:${req.link.visitorId}`;
    return {
      key: `link:${req.link.visitorId}`,
      name: guestName(seed),
      avatarSeed: seed,
      kind: "guest",
    };
  }

  return null;
}

export const presenceService = {
  async heartbeat(req: Request, documentId: string, input: HeartbeatInput) {
    const access = await accessService.contextAccess(req, documentId);
    if (!access) throw notFound("Document not found");

    const who = identify(req, documentId);
    if (!who) throw notFound("Document not found");

    const activity =
      input.activity === "editing" && atLeast(access.role, "editor")
        ? "editing"
        : "viewing";

    return presenceStore.touch(documentId, { ...who, activity });
  },

  async identity(req: Request, documentId: string) {
    const access = await accessService.contextAccess(req, documentId);
    if (!access) throw notFound("Document not found");

    const who = identify(req, documentId);
    if (!who) throw notFound("Document not found");

    const identity = {
      ...who,
      color: identityFor(who.key),
      role: access.role,
    };

    // The socket is opened against a different host, so it cannot rely on this
    // request's cookie; it carries this token instead.
    return { ...identity, token: await collabToken.issue(identity, documentId) };
  },

  async leave(req: Request, documentId: string) {
    const who = identify(req, documentId);
    if (who) presenceStore.leave(documentId, who.key);
  },
};
