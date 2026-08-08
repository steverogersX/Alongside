"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const AUTOSAVE_MS = 1200;

export function DocEditor({
  content,
  editable,
  onSave,
  saving,
}: {
  content: unknown;
  editable: boolean;
  onSave: (content: unknown) => void;
  saving: boolean;
}) {
  const [dirty, setDirty] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [StarterKit.configure({ paragraph: false }), ClaimedParagraph],
    content: content as object,
    editorProps: {
      attributes: { class: "doc-prose outline-none", spellcheck: "false" },
    },
  });

  const releaseClaims = useCallback(() => {
    if (!editor) return false;

    const positions: number[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "paragraph" && node.attrs.claim) positions.push(pos);
    });
    if (positions.length === 0) return false;

    const tr = editor.state.tr;
    positions.forEach((pos) => {
      const node = editor.state.doc.nodeAt(pos);
      if (node) tr.setNodeMarkup(pos, undefined, { ...node.attrs, claim: null });
    });
    editor.view.dispatch(tr);
    return true;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      releaseClaims();
      setDirty(true);

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        onSave(editor.getJSON());
        setDirty(false);
      }, AUTOSAVE_MS);
    };

    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [editor, onSave, releaseClaims]);

  const state = useEditorState({
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
    { icon: Bold, label: "Bold", active: state?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { icon: Italic, label: "Italic", active: state?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    { icon: Strikethrough, label: "Strikethrough", active: state?.strike, run: () => editor?.chain().focus().toggleStrike().run() },
    { icon: Code, label: "Code", active: state?.code, run: () => editor?.chain().focus().toggleCode().run() },
    { icon: Heading2, label: "Heading", active: state?.heading, run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { icon: List, label: "Bullet list", active: state?.bullet, run: () => editor?.chain().focus().toggleBulletList().run() },
    { icon: ListOrdered, label: "Numbered list", active: state?.ordered, run: () => editor?.chain().focus().toggleOrderedList().run() },
    { icon: Quote, label: "Quote", active: state?.quote, run: () => editor?.chain().focus().toggleBlockquote().run() },
  ];

  return (
    <div className="flex flex-1 flex-col">
      {editable && (
        <div className="sticky top-12 z-10 flex items-center gap-0.5 rounded-lg bg-sidebar/90 px-2 py-1.5 backdrop-blur-md">
          {tools.map((tool) => (
            <Button
              key={tool.label}
              variant="ghost"
              size="icon-sm"
              aria-label={tool.label}
              aria-pressed={tool.active}
              onClick={tool.run}
              className={cn(
                tool.active ? "bg-accent text-foreground" : "text-muted-foreground"
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
            disabled={!state?.canUndo}
            onClick={() => editor?.chain().focus().undo().run()}
            className="text-muted-foreground"
          >
            <Undo2 />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Redo"
            disabled={!state?.canRedo}
            onClick={() => editor?.chain().focus().redo().run()}
            className="text-muted-foreground"
          >
            <Redo2 />
          </Button>

          <span className="ml-auto flex items-center gap-3 text-[11.5px] text-muted-foreground tabular-nums">
            <span>{state?.words ?? 0} words</span>
            <span className="w-16 text-right">
              {saving ? "Saving…" : dirty ? "Unsaved" : "Saved"}
            </span>
          </span>
        </div>
      )}

      {editor && editable && (
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
                tool.active ? "bg-accent text-foreground" : "text-popover-foreground/70"
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
