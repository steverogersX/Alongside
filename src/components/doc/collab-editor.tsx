"use client";

import { useEffect } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { FontFamily, TextStyle } from "@tiptap/extension-text-style";
import {
  Bold,
  Code,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ClaimedParagraph } from "@/components/doc/claimed-paragraph";
import { DOC_FONTS, FontPicker } from "@/components/doc/font-picker";
import type { CollabSession } from "@/lib/collab";
import { cn } from "@/lib/utils";

export function CollabEditor({
  session,
  editable,
  seed,
  connected,
}: {
  session: CollabSession;
  editable: boolean;
  seed: unknown;
  connected: boolean;
}) {
  const { provider, doc, identity } = session;

  const editor = useEditor(
    {
      immediatelyRender: false,
      editable,
      extensions: [
        // History lives in the CRDT — the local undo stack would fight it.
        StarterKit.configure({ paragraph: false, undoRedo: false }),
        ClaimedParagraph,
        TextStyle,
        FontFamily,
        Collaboration.configure({ document: doc }),
        // The extension owns the awareness "user" field and overwrites it with
        // exactly this object, so the presence bar's fields have to live here.
        CollaborationCaret.configure({
          provider,
          user: {
            key: identity.key,
            name: identity.name,
            color: identity.color,
            avatarSeed: identity.avatarSeed,
            kind: identity.kind,
          },
        }),
      ],
      editorProps: {
        attributes: { class: "doc-prose outline-none", spellcheck: "false" },
      },
    },
    [provider, doc]
  );

  // The first client into an empty room plants the stored content, so a room
  // that nobody has opened yet is not blank.
  useEffect(() => {
    if (!editor || !connected || !editable || !seed) return;

    const fragment = doc.getXmlFragment("default");
    if (fragment.length > 0) return;

    editor.commands.setContent(seed as object, { emitUpdate: true });
  }, [editor, connected, editable, seed, doc]);

  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      bold: instance?.isActive("bold") ?? false,
      italic: instance?.isActive("italic") ?? false,
      strike: instance?.isActive("strike") ?? false,
      code: instance?.isActive("code") ?? false,
      heading: instance?.isActive("heading", { level: 2 }) ?? false,
      bullet: instance?.isActive("bulletList") ?? false,
      ordered: instance?.isActive("orderedList") ?? false,
      quote: instance?.isActive("blockquote") ?? false,
      fontFamily:
        (instance?.getAttributes("textStyle").fontFamily as string | undefined) ??
        "",
      words:
        instance?.getText().trim().split(/\s+/).filter(Boolean).length ?? 0,
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
        <div className="sticky top-0 z-10 -mx-2 flex items-center gap-0.5 rounded-lg bg-card/92 px-2 py-1.5 backdrop-blur-md">
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

          <FontPicker
            editor={editor}
            activeFontId={
              DOC_FONTS.find((font) => font.stack === state?.fontFamily)?.id ??
              "default"
            }
          />

          <Separator orientation="vertical" className="mx-1 h-4" />

          <span className="datum flex items-center gap-1.5 text-muted-foreground">
            <span
              className={cn(
                "size-1.5 rounded-full",
                connected ? "bg-online" : "animate-agent-pulse bg-muted-foreground"
              )}
            />
            {connected ? "Live" : "Connecting"}
          </span>

          <span className="datum ml-auto text-muted-foreground">
            {state?.words ?? 0} words
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
