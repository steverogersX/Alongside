import { hocuspocus } from "@/modules/collab/collab.server.ts";

export type DocumentEvent = "chat" | "runs";

/**
 * Everyone in a document already holds an authenticated socket, so a change
 * elsewhere in the system can ride it: the server says what changed and each
 * client refetches that one thing. No polling, no second transport.
 */
export function notify(documentId: string, event: DocumentEvent) {
  const document = hocuspocus.documents.get(documentId);
  if (!document) return;

  document.broadcastStateless(JSON.stringify({ event }));
}
