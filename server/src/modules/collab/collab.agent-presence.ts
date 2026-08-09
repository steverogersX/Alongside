import * as Y from "yjs";

import type { User } from "@/db/types.ts";
import { hocuspocus } from "@/modules/collab/collab.server.ts";

const FIELD = "default";

// Violet, matching the colour the UI reserves for agents.
const AGENT_COLOR = "#8b5cf6";

async function documentFor(documentId: string) {
  const connection = await hocuspocus.openDirectConnection(documentId, {
    identity: { role: "admin" },
    documentId,
  });

  await connection.disconnect();

  return hocuspocus.documents.get(documentId) ?? null;
}

/**
 * An agent joins the room the same way a person does — an awareness entry, so
 * everyone watching sees who is working before the text starts changing.
 * Runs are serialised per document, so one slot on the server is enough.
 */
export const agentPresence = {
  async join(documentId: string, agent: User, invoker: User) {
    const document = await documentFor(documentId);
    if (!document) return;

    // Hocuspocus starts the server's own awareness at null, and
    // setLocalStateField is a no-op on a null state — so always set the whole
    // object.
    document.awareness.setLocalState({
      user: {
        key: `agent:${agent.id}`,
        name: agent.displayName,
        color: AGENT_COLOR,
        avatarSeed: agent.avatarSeed,
        kind: "agent",
        forName: invoker.displayName,
      },
    });
  },

  async moveTo(documentId: string, blockIndex: number) {
    const document = await documentFor(documentId);
    if (!document) return;

    const fragment = document.getXmlFragment(FIELD);
    const index = Math.max(0, Math.min(blockIndex, fragment.length));

    try {
      const position = Y.createRelativePositionFromTypeIndex(fragment, index);
      const json = Y.relativePositionToJSON(position);
      const state = document.awareness.getLocalState();
      if (!state) return;

      document.awareness.setLocalState({
        ...state,
        cursor: { anchor: json, head: json },
      });
    } catch {
      // A caret is a nicety; never let it break the edit that earned it.
    }
  },

  async leave(documentId: string) {
    const document = hocuspocus.documents.get(documentId);
    if (!document) return;

    document.awareness.setLocalState(null);
  },
};
