import { eq } from "drizzle-orm";
import * as Y from "yjs";

import { db } from "@/db/client.ts";
import { documents } from "@/db/schema/index.ts";

const FIELD = "default";

type Node = {
  type?: string;
  text?: string;
  attrs?: { level?: number };
  content?: Node[];
};

function textOf(node: Node): string {
  if (typeof node.text === "string") return node.text;
  return (node.content ?? []).map(textOf).join("");
}

/**
 * First time a document is opened there is no Yjs state, only the JSON the
 * document was created with — so build the tree from that. Everything after
 * that round-trips through the binary state and stays lossless.
 */
function fromJson(content: unknown, fragment: Y.XmlFragment) {
  const blocks = (content as Node)?.content ?? [];

  const nodes = blocks.map((block) => {
    const element = new Y.XmlElement(block.type ?? "paragraph");

    if (block.type === "heading") {
      element.setAttribute("level", String(block.attrs?.level ?? 1));
    }

    const text = new Y.XmlText();
    text.insert(0, textOf(block));
    element.insert(0, [text]);

    return element;
  });

  if (nodes.length > 0) fragment.insert(0, nodes);
}

export const collabPersistence = {
  async load(documentId: string, doc: Y.Doc) {
    const [row] = await db
      .select({ state: documents.state, content: documents.content })
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!row) return;

    if (row.state) {
      Y.applyUpdate(doc, new Uint8Array(row.state));
      return;
    }

    fromJson(row.content, doc.getXmlFragment(FIELD));
  },

  async store(documentId: string, doc: Y.Doc) {
    await db
      .update(documents)
      .set({
        state: Buffer.from(Y.encodeStateAsUpdate(doc)),
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));
  },
};
