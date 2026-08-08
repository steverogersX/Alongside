"use client";

import { useCallback, useEffect, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ClaimedParagraph } from "@/components/doc/claimed-paragraph";
import { cn } from "@/lib/utils";
import type { Block } from "@/lib/data";

function toHtml(blocks: Block[]) {
  return blocks
    .map((block) => {
      if (block.kind === "h2") return `<h2>${block.text}</h2>`;
      const claim = block.claimedBy ? ` data-claim="${block.claimedBy}"` : "";
      return `<p${claim}>${block.text}</p>`;
    })
    .join("");
}

export function DocEditor({
  blocks,
  onYield,
}: {
  blocks: Block[];
  onYield?: (agent: string) => void;
}) {
  const claimedBy = blocks.find((b) => b.claimedBy)?.claimedBy ?? null;
  const [heldBy, setHeldBy] = useState<string | null>(claimedBy);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ paragraph: false }),
      ClaimedParagraph,
    ],
    content: toHtml(blocks),
    editorProps: {
      attributes: {
        class: "doc-prose outline-none",
        spellcheck: "false",
      },
    },
  });

  const release = useCallback(() => {
    if (!editor || !heldBy) return;

    const { state } = editor;
    const positions: number[] = [];
    state.doc.descendants((node, pos) => {
      if (node.type.name === "paragraph" && node.attrs.claim) positions.push(pos);
    });
    if (positions.length === 0) return;

    const tr = state.tr;
    positions.forEach((pos) => {
      const node = state.doc.nodeAt(pos);
      if (node) tr.setNodeMarkup(pos, undefined, { ...node.attrs, claim: null });
    });
    editor.view.dispatch(tr);

    onYield?.(heldBy);
    setHeldBy(null);
  }, [editor, heldBy, onYield]);

  useEffect(() => {
    if (!editor) return;
    const handler = () => release();
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, release]);

  const stats = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive("bold") ?? false,
      italic: e?.isActive("italic") ?? false,
      strike: e?.isActive("strike") ?? false,
      code: e?.isActive("code") ?? false,
      heading: e?.isActive("heading", { level: 2 }) ?? false,
      bullet: e?.isActive("bulletList") ?? false,
      ordered: e?.isActive("orderedList") ?? false,
      quote: e?.isActive("blockquote") ?? false,
      canUndo: e?.can().undo() ?? false,
      canRedo: e?.can().redo() ?? false,
      words: e?.getText().trim().split(/\s+/).filter(Boolean).length ?? 0,
    }),
  });

  const tools = [
    {
      icon: Bold,
      label: "Bold",
      active: stats?.bold,
      run: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: "Italic",
      active: stats?.italic,
      run: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      active: stats?.strike,
      run: () => editor?.chain().focus().toggleStrike().run(),
    },
    {
      icon: Code,
      label: "Code",
      active: stats?.code,
      run: () => editor?.chain().focus().toggleCode().run(),
    },
    {
      icon: Heading2,
      label: "Heading",
      active: stats?.heading,
      run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: List,
      label: "Bullet list",
      active: stats?.bullet,
      run: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      active: stats?.ordered,
      run: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: Quote,
      label: "Quote",
      active: stats?.quote,
      run: () => editor?.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-12 z-10 -mx-2 flex items-center gap-0.5 rounded-lg bg-sidebar/90 px-2 py-1.5 backdrop-blur-md">
        {tools.map((tool) => (
          <Button
            key={tool.label}
            variant="ghost"
            size="icon-sm"
            aria-label={tool.label}
            aria-pressed={tool.active}
            onClick={tool.run}
            className={cn(
              tool.active
                ? "bg-accent text-foreground"
                : "text-muted-foreground"
            )}
          >
            <tool.icon />
          </Button>
        ))}

        <Separator orientation="vertical" className="mx-1 h-4" />

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Undo"
          disabled={!stats?.canUndo}
          onClick={() => editor?.chain().focus().undo().run()}
          className="text-muted-foreground"
        >
          <Undo2 />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Redo"
          disabled={!stats?.canRedo}
          onClick={() => editor?.chain().focus().redo().run()}
          className="text-muted-foreground"
        >
          <Redo2 />
        </Button>

        <span className="ml-auto text-[11.5px] text-muted-foreground tabular-nums">
          {stats?.words ?? 0} words
        </span>
      </div>

      {editor && (
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-md"
        >
          {tools.slice(0, 4).map((tool) => (
            <Button
              key={tool.label}
              variant="ghost"
              size="icon-xs"
              aria-label={tool.label}
              onClick={tool.run}
              className={cn(
                tool.active
                  ? "bg-accent text-foreground"
                  : "text-popover-foreground/70"
              )}
            >
              <tool.icon />
            </Button>
          ))}
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className="mt-6 flex-1" />
    </div>
  );
}
