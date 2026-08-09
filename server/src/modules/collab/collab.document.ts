import type * as Y from "yjs";

import { hocuspocus } from "@/modules/collab/collab.server.ts";

const FIELD = "default";

async function withDocument<T>(
  documentId: string,
  run: (doc: Y.Doc) => T
): Promise<T> {
  const connection = await hocuspocus.openDirectConnection(documentId, {
    identity: { role: "admin" },
    documentId,
  });

  try {
    let result!: T;
    await connection.transact((doc) => {
      result = run(doc);
    });
    return result;
  } finally {
    await connection.disconnect();
  }
}

function texts(fragment: Y.XmlFragment): Y.XmlText[] {
  const found: Y.XmlText[] = [];

  const walk = (node: Y.XmlElement | Y.XmlFragment) => {
    for (const child of node.toArray()) {
      if (typeof (child as Y.XmlText).insert === "function") {
        found.push(child as Y.XmlText);
      } else if (typeof (child as Y.XmlElement).toArray === "function") {
        walk(child as Y.XmlElement);
      }
    }
  };

  walk(fragment);
  return found;
}

const blocks = (fragment: Y.XmlFragment) =>
  fragment
    .toArray()
    .map((node) => String(node))
    .join("");

export const collabDocument = {
  async read(documentId: string) {
    return withDocument(documentId, (doc) => {
      const fragment = doc.getXmlFragment(FIELD);
      return texts(fragment)
        .map((text) => text.toString())
        .filter((line) => line.length > 0)
        .join("\n\n");
    });
  },

  /**
   * Anchored rather than offset-based: the document can change while an agent
   * is thinking, so a match that is no longer unique must fail loudly instead
   * of rewriting the wrong paragraph.
   */
  async replace(documentId: string, find: string, replace: string) {
    return withDocument(documentId, (doc) => {
      const nodes = texts(doc.getXmlFragment(FIELD));

      const hits = nodes.flatMap((node) => {
        const value = node.toString();
        const positions: { node: Y.XmlText; index: number }[] = [];

        let from = value.indexOf(find);
        while (from !== -1) {
          positions.push({ node, index: from });
          from = value.indexOf(find, from + find.length);
        }

        return positions;
      });

      if (hits.length === 0) return { applied: false, occurrences: 0 };
      if (hits.length > 1) {
        return { applied: false, occurrences: hits.length };
      }

      const hit = hits[0]!;
      hit.node.delete(hit.index, find.length);
      if (replace.length > 0) hit.node.insert(hit.index, replace);

      return { applied: true, occurrences: 1 };
    });
  },

  async insertAfter(documentId: string, anchor: string, text: string) {
    return withDocument(documentId, (doc) => {
      const nodes = texts(doc.getXmlFragment(FIELD));

      const matches = nodes.filter((node) => node.toString().includes(anchor));
      if (matches.length === 0) return { applied: false, occurrences: 0 };
      if (matches.length > 1) {
        return { applied: false, occurrences: matches.length };
      }

      const node = matches[0]!;
      const value = node.toString();
      node.insert(value.length, ` ${text}`);

      return { applied: true, occurrences: 1 };
    });
  },

  async outline(documentId: string) {
    return withDocument(documentId, (doc) => blocks(doc.getXmlFragment(FIELD)));
  },
};
