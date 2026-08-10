"use client";

import { useEffect, useState } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";

import { api } from "@/lib/api";

export type CollabIdentity = {
  key: string;
  name: string;
  avatarSeed: string;
  color: string;
  kind: "member" | "guest" | "agent";
  role: "viewer" | "editor" | "admin";
  token: string;
};

export type AwarenessUser = {
  key: string;
  name: string;
  avatarSeed: string;
  color: string;
  kind: CollabIdentity["kind"];
  forName?: string;
  provider?: string | null;
};

/**
 * The socket goes straight to the collaboration server. A WebSocket upgrade
 * cannot be proxied through the app's rewrites, so this is the one address the
 * browser still reaches directly — and why the connection authenticates with a
 * token rather than a cookie it would never be allowed to send.
 */
const COLLAB_URL =
  process.env.NEXT_PUBLIC_COLLAB_URL ?? "ws://localhost:4000/collab";

function socketUrl(documentId: string, token: string) {
  const base = new URL(COLLAB_URL);
  base.search = `?doc=${encodeURIComponent(documentId)}&token=${encodeURIComponent(token)}`;
  return base.toString();
}

export const fetchIdentity = (documentId: string) =>
  api<CollabIdentity>(`/documents/${documentId}/identity`);

export type CollabSession = {
  provider: HocuspocusProvider;
  doc: Y.Doc;
  identity: CollabIdentity;
};

type Entry = {
  refs: number;
  session: CollabSession | null;
  status: "connecting" | "connected" | "error";
  loading: Promise<void> | null;
  listeners: Set<() => void>;
};

/**
 * The editor and the chat rail are separate components looking at the same
 * document, and they must not open two sockets — so sessions are shared and
 * reference counted rather than owned by whichever mounted first.
 */
const sessions = new Map<string, Entry>();

function entryFor(documentId: string) {
  let entry = sessions.get(documentId);

  if (!entry) {
    entry = {
      refs: 0,
      session: null,
      status: "connecting",
      loading: null,
      listeners: new Set(),
    };
    sessions.set(documentId, entry);
  }

  return entry;
}

const announce = (entry: Entry) => {
  for (const listener of entry.listeners) listener();
};

function acquire(documentId: string) {
  const entry = entryFor(documentId);
  entry.refs += 1;

  entry.loading ??= (async () => {
    try {
      const identity = await fetchIdentity(documentId);
      const doc = new Y.Doc();

      const provider = new HocuspocusProvider({
        url: socketUrl(documentId, identity.token),
        name: documentId,
        document: doc,
        onStatus: ({ status }) => {
          entry.status = status === "connected" ? "connected" : "connecting";
          announce(entry);
        },
      });

      entry.session = { provider, doc, identity };
    } catch {
      entry.status = "error";
    }

    announce(entry);
  })();

  return entry;
}

function release(documentId: string) {
  const entry = sessions.get(documentId);
  if (!entry) return;

  entry.refs -= 1;
  if (entry.refs > 0) return;

  entry.session?.provider.destroy();
  sessions.delete(documentId);
}

export function useCollabSession(documentId: string, enabled: boolean) {
  const [, bump] = useState(0);
  const entry = enabled && documentId ? sessions.get(documentId) : undefined;

  useEffect(() => {
    if (!enabled || !documentId) return;

    const current = acquire(documentId);
    const listener = () => bump((value) => value + 1);
    current.listeners.add(listener);
    listener();

    return () => {
      current.listeners.delete(listener);
      release(documentId);
    };
  }, [documentId, enabled]);

  return {
    session: entry?.session ?? null,
    status: entry?.status ?? "connecting",
  };
}

/**
 * The server pushes a bare "what changed" down the same socket; the client
 * decides what to refetch. Cheaper than polling and instant.
 */
export function useDocumentEvents(
  documentId: string,
  enabled: boolean,
  onEvent: (event: string) => void
) {
  const { session } = useCollabSession(documentId, enabled);

  useEffect(() => {
    const provider = session?.provider;
    if (!provider) return;

    const handler = ({ payload }: { payload: string }) => {
      try {
        const parsed = JSON.parse(payload) as { event?: string };
        if (parsed.event) onEvent(parsed.event);
      } catch {
        // A malformed broadcast is not worth breaking the room over.
      }
    };

    provider.on("stateless", handler);

    return () => {
      provider.off("stateless", handler);
    };
  }, [session, onEvent]);
}
