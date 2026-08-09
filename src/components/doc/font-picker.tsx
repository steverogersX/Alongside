"use client";

import type { Editor } from "@tiptap/react";
import { ChevronDown, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DocFont = {
  id: string;
  label: string;
  /** Empty means "use the document default" and clears the mark. */
  stack: string;
};

export const DOC_FONTS: DocFont[] = [
  { id: "default", label: "Document default", stack: "" },
  {
    id: "source-serif",
    label: "Source Serif",
    stack: "var(--font-source-serif), ui-serif, Georgia, serif",
  },
  {
    id: "lora",
    label: "Lora",
    stack: "var(--font-lora), ui-serif, Georgia, serif",
  },
  {
    id: "newsreader",
    label: "Newsreader",
    stack: "var(--font-newsreader), ui-serif, Georgia, serif",
  },
  {
    id: "archivo",
    label: "Archivo",
    stack: "var(--font-archivo), ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: "mono",
    label: "IBM Plex Mono",
    stack: "var(--font-plex-mono), ui-monospace, monospace",
  },
];

export function FontPicker({
  editor,
  activeFontId,
}: {
  editor: Editor | null;
  activeFontId: string;
}) {
  const active =
    DOC_FONTS.find((font) => font.id === activeFontId) ?? DOC_FONTS[0]!;

  function apply(font: DocFont) {
    if (!editor) return;

    const chain = editor.chain().focus();
    if (font.stack) chain.setFontFamily(font.stack).run();
    else chain.unsetFontFamily().run();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Font"
          className="gap-1.5 font-normal text-muted-foreground"
        >
          <Type />
          <span className="hidden max-w-24 truncate sm:inline">
            {active.label}
          </span>
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-48">
        <DropdownMenuLabel className="eyebrow">Font</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {DOC_FONTS.map((font) => (
          <DropdownMenuCheckItem
            key={font.id}
            checked={font.id === active.id}
            onSelect={() => apply(font)}
            style={font.stack ? { fontFamily: font.stack } : undefined}
          >
            {font.label}
          </DropdownMenuCheckItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
