import * as Y from "yjs";

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

const isElement = (node: unknown): node is Y.XmlElement =>
  typeof (node as Y.XmlElement)?.nodeName === "string";

function elements(fragment: Y.XmlFragment): Y.XmlElement[] {
  return fragment.toArray().filter(isElement);
}

function blockText(node: Y.XmlElement): string {
  const parts: string[] = [];

  const walk = (current: Y.XmlElement) => {
    for (const child of current.toArray()) {
      if (isElement(child)) walk(child);
      else parts.push(String(child));
    }
  };

  walk(node);
  return parts.join("");
}

// Short names in, short names out — the tool descriptions promise p and h1,
// so the ProseMirror node names never reach the model.
function blockType(node: Y.XmlElement): string {
  if (node.nodeName === "heading") {
    return `h${node.getAttribute("level") ?? "1"}`;
  }

  return node.nodeName === "paragraph" ? "p" : node.nodeName;
}

const EXPECT_CHARS = 40;

const shorten = (value: string) =>
  value.replace(/\s+/g, " ").trim().slice(0, EXPECT_CHARS);

/**
 * An index is only trustworthy for as long as nobody else edits — so every
 * block operation carries the text it believes is there, and we refuse rather
 * than change the wrong paragraph.
 */
function verify(nodes: Y.XmlElement[], index: number, expect: string) {
  if (index < 0 || index >= nodes.length) {
    return {
      error: "out_of_range" as const,
      message: `There are ${nodes.length} blocks — ${index} is not one of them.`,
    };
  }

  const actual = shorten(blockText(nodes[index]!));
  if (shorten(expect) !== actual) {
    return {
      error: "moved" as const,
      message: `Block ${index} now starts with "${actual}". Read the document again.`,
    };
  }

  return null;
}

function makeBlock(type: string, text: string) {
  const heading = /^h([1-6])$/.exec(type);
  const nodeName = heading ? "heading" : type === "p" ? "paragraph" : type;
  const element = new Y.XmlElement(nodeName);

  if (heading) element.setAttribute("level", heading[1]!);

  const content = new Y.XmlText();
  content.insert(0, text);
  element.insert(0, [content]);

  return element;
}

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

  async blocks(documentId: string) {
    return withDocument(documentId, (doc) =>
      elements(doc.getXmlFragment(FIELD)).map((node, index) => ({
        index,
        type: blockType(node),
        text: blockText(node),
      }))
    );
  },

  async replaceBlock(
    documentId: string,
    index: number,
    text: string,
    expect: string
  ) {
    return withDocument(documentId, (doc) => {
      const fragment = doc.getXmlFragment(FIELD);
      const nodes = elements(fragment);

      const problem = verify(nodes, index, expect);
      if (problem) return problem;

      const node = nodes[index]!;
      const children = node.toArray();
      const first = children[0];

      // Keeping the element means its type and attributes survive; only its
      // text changes.
      if (children.length === 1 && !isElement(first)) {
        const content = first as Y.XmlText;
        content.delete(0, content.length);
        content.insert(0, text);
        return { applied: true as const };
      }

      const at = fragment.toArray().indexOf(node);
      fragment.delete(at, 1);
      fragment.insert(at, [makeBlock(blockType(node), text)]);

      return { applied: true as const };
    });
  },

  async deleteBlock(documentId: string, index: number, expect: string) {
    return withDocument(documentId, (doc) => {
      const fragment = doc.getXmlFragment(FIELD);
      const nodes = elements(fragment);

      const problem = verify(nodes, index, expect);
      if (problem) return problem;

      const at = fragment.toArray().indexOf(nodes[index]!);
      const removed = blockText(nodes[index]!);
      fragment.delete(at, 1);

      return { applied: true as const, removed };
    });
  },

  async insertBlock(
    documentId: string,
    after: number,
    text: string,
    type: string
  ) {
    return withDocument(documentId, (doc) => {
      const fragment = doc.getXmlFragment(FIELD);
      const nodes = elements(fragment);

      if (after >= nodes.length) {
        return {
          error: "out_of_range" as const,
          message: `There are ${nodes.length} blocks — ${after} is not one of them.`,
        };
      }

      const at =
        after < 0 ? 0 : fragment.toArray().indexOf(nodes[after]!) + 1;

      fragment.insert(at, [makeBlock(type, text)]);

      return { applied: true as const, index: after < 0 ? 0 : after + 1 };
    });
  },
};
