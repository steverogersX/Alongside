import type { IncomingMessage, Server as HttpServer } from "node:http";
import type { Duplex } from "node:stream";
import {
  Hocuspocus,
  type onConnectPayload,
  type onLoadDocumentPayload,
  type onStoreDocumentPayload,
} from "@hocuspocus/server";
import { WebSocketServer } from "ws";

import { isProd } from "@/config/env.ts";
import {
  identifyConnection,
  type CollabIdentity,
} from "@/modules/collab/collab.identity.ts";
import { collabPersistence } from "@/modules/collab/collab.persistence.ts";
import { collabToken } from "@/modules/collab/collab.token.ts";
import { atLeast } from "@/shared/role.ts";

export const COLLAB_PATH = "/collab";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ConnectionContext = { identity: CollabIdentity; documentId: string };

/**
 * The Yjs state is the source of truth and is written back debounced, so an
 * agent can edit a document nobody currently has open and the change survives.
 */
export const hocuspocus = new Hocuspocus({
  name: "alongside",
  quiet: isProd,
  debounce: 2000,
  maxDebounce: 10_000,

  async onLoadDocument({ documentName, document }: onLoadDocumentPayload) {
    await collabPersistence.load(documentName, document);
    return document;
  },

  async onStoreDocument({ documentName, document }: onStoreDocumentPayload) {
    await collabPersistence.store(documentName, document);
  },

  async onConnect({
    context,
    documentName,
    connectionConfig,
  }: onConnectPayload) {
    const { identity, documentId } = context as ConnectionContext;

    // The upgrade authorised ?doc=<id>, but the room is keyed by the name the
    // client sends. Without this they could authorise for one document and
    // join another.
    if (documentName !== documentId) {
      throw new Error("Document mismatch");
    }

    connectionConfig.readOnly = !atLeast(identity.role, "editor");
  },
});

export function mountCollabServer(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on(
    "upgrade",
    async (request: IncomingMessage, socket: Duplex, head: Buffer) => {
      let url: URL;

      try {
        url = new URL(request.url ?? "", `http://${request.headers.host}`);
      } catch {
        return reject(socket, 400, "Bad Request");
      }

      if (url.pathname !== COLLAB_PATH) return;

      const documentId = url.searchParams.get("doc") ?? "";
      if (!UUID.test(documentId)) {
        return reject(socket, 400, "Bad Request");
      }

      let identity: CollabIdentity | null = null;

      try {
        // The token comes first: a browser blocking third-party cookies sends
        // nothing here, and that is the default in private windows.
        const token = url.searchParams.get("token");

        identity = token
          ? await collabToken.verify(token, documentId)
          : await identifyConnection(request, documentId);
      } catch (error) {
        console.error("collab upgrade failed", error);
        return reject(socket, 500, "Internal Server Error");
      }

      if (!identity) return reject(socket, 401, "Unauthorized");

      wss.handleUpgrade(request, socket, head, (websocket) => {
        hocuspocus.handleConnection(websocket, request, {
          identity,
          documentId,
        } satisfies ConnectionContext);
      });
    }
  );

  return hocuspocus;
}

function reject(socket: Duplex, status: number, message: string) {
  socket.write(`HTTP/1.1 ${status} ${message}\r\n\r\n`);
  socket.destroy();
}
