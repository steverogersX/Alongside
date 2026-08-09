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

const HTTP_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function socketUrl(documentId: string) {
  const base = new URL(HTTP_BASE);
  base.protocol = base.protocol === "https:" ? "wss:" : "ws:";
  base.pathname = "/collab";
  base.search = `?doc=${encodeURIComponent(documentId)}`;
  return base.toString();
}

export const fetchIdentity = (documentId: string) =>
  api<CollabIdentity>(`/documents/${documentId}/identity`);

export type CollabSession = {
  provider: HocuspocusProvider;
  doc: Y.Doc;
  identity: CollabIdentity;
};

/**
 * One provider per document, torn down on unmount. The identity comes from the
 * server so a guest's generated name is the same for everyone in the room.
 */
export function useCollabSession(documentId: string, enabled: boolean) {
  const [session, setSession] = useState<CollabSession | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">(
    "connecting"
  );

  useEffect(() => {
    if (!enabled || !documentId) return;

    let provider: HocuspocusProvider | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const identity = await fetchIdentity(documentId);
        if (cancelled) return;

        const doc = new Y.Doc();

        provider = new HocuspocusProvider({
          url: socketUrl(documentId),
          name: documentId,
          document: doc,
          onStatus: ({ status: next }) => {
            setStatus(next === "connected" ? "connected" : "connecting");
          },
        });

        setSession({ provider, doc, identity });
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      provider?.destroy();
      setSession(null);
    };
  }, [documentId, enabled]);

  return { session, status };
}
