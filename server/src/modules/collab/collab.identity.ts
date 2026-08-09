import type { IncomingMessage } from "node:http";
import { parse as parseCookie } from "cookie";
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator";

import type { Role } from "@/db/types.ts";
import { SESSION_COOKIE } from "@/modules/auth/session.constants.ts";
import { sessionService } from "@/modules/auth/session.service.ts";
import { accessService } from "@/modules/access/access.service.ts";
import { LINK_COOKIE } from "@/modules/links/link.constants.ts";
import { linkService } from "@/modules/links/link.service.ts";

export type CollabIdentity = {
  key: string;
  name: string;
  avatarSeed: string;
  color: string;
  kind: "member" | "guest" | "agent";
  role: Role;
};

/**
 * Cursor colours. Distinct at a glance, and legible on both the paper and the
 * dark ground — violet is left out because it means "agent" everywhere else.
 */
const COLORS = [
  "#2f7d6e",
  "#3d6ea8",
  "#b0523f",
  "#8a6d1f",
  "#7a4a86",
  "#2e6f8e",
  "#a04a72",
  "#4c7a35",
];

export function identityFor(key: string) {
  return colorFor(key);
}

function colorFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return COLORS[hash % COLORS.length]!;
}

const guestName = (seed: string) =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: " ",
    style: "capital",
    seed,
  });

/**
 * Resolves who is on the other end of a socket using the same cookies and the
 * same permission service as the HTTP API — one access model, not two.
 */
export async function identifyConnection(
  request: IncomingMessage,
  documentId: string
): Promise<CollabIdentity | null> {
  const cookies = parseCookie(request.headers.cookie ?? "");

  const sessionToken = cookies[SESSION_COOKIE];
  if (sessionToken) {
    const resolved = await sessionService.resolve(sessionToken);
    if (resolved) {
      const role = await accessService.documentRole(resolved.user, documentId);
      if (!role) return null;

      const key = `user:${resolved.user.id}`;
      return {
        key,
        name: resolved.user.displayName,
        avatarSeed: resolved.user.avatarSeed,
        color: colorFor(key),
        kind: resolved.user.kind === "bot" ? "agent" : "member",
        role,
      };
    }
  }

  const linkToken = cookies[LINK_COOKIE];
  if (linkToken) {
    const resolved = await linkService.resolve(linkToken);
    if (resolved && resolved.link.documentId === documentId) {
      const key = `link:${resolved.visitorId}`;
      const seed = `${documentId}:${resolved.visitorId}`;
      return {
        key,
        name: guestName(seed),
        avatarSeed: seed,
        color: colorFor(key),
        kind: "guest",
        role: resolved.role,
      };
    }
  }

  return null;
}
