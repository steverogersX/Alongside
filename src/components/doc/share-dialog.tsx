"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, Globe, Link2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FeedSkeleton } from "@/components/skeletons";
import {
  useCreateLink,
  useDocumentLinks,
  useRevokeLink,
} from "@/lib/queries";
import type { ChatAccess } from "@/lib/types";
import { cn } from "@/lib/utils";

const EXPIRY = [
  { label: "No expiry", days: undefined },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
];

export function ShareDialog({
  documentId,
  trigger,
}: {
  documentId: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [chat, setChat] = useState<ChatAccess>("none");
  const [days, setDays] = useState<number | undefined>(undefined);
  const [fresh, setFresh] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const links = useDocumentLinks(documentId, open);
  const createLink = useCreateLink(documentId);
  const revokeLink = useRevokeLink(documentId);

  const list = links.data?.links ?? [];

  function create() {
    createLink.mutate(
      { role, chatAccess: chat, ...(days ? { expiresInDays: days } : {}) },
      {
        onSuccess: (result) => {
          setFresh(`${window.location.origin}/s/${result.token}`);
          setCopied(false);
        },
      }
    );
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setFresh(null);
          setCopied(false);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share this document</DialogTitle>
          <DialogDescription>
            Anyone with the link can open it — no account needed. Revoke a link
            and it stops working immediately.
          </DialogDescription>
        </DialogHeader>

        {fresh ? (
          <div className="flex flex-col gap-2 rounded-lg border border-agent/25 bg-agent-muted/40 p-3">
            <span className="text-[12px] font-medium text-agent">
              Copy this now — it won&rsquo;t be shown again
            </span>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={fresh}
                onFocus={(event) => event.currentTarget.select()}
                className="h-8 bg-card font-mono text-[11.5px]"
              />
              <Button size="sm" onClick={() => void copy(fresh)}>
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] text-muted-foreground">
                People with the link can
              </span>
              <Segmented
                options={[
                  { value: "viewer", label: "read" },
                  { value: "editor", label: "edit" },
                ]}
                value={role}
                onChange={(next) => setRole(next as "viewer" | "editor")}
              />
              <Segmented
                options={EXPIRY.map((option) => ({
                  value: String(option.days ?? "none"),
                  label: option.label,
                }))}
                value={String(days ?? "none")}
                onChange={(next) =>
                  setDays(next === "none" ? undefined : Number(next))
                }
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] text-muted-foreground">
                Document chat
              </span>
              <Segmented
                options={[
                  { value: "none", label: "hidden" },
                  { value: "read", label: "read" },
                  { value: "write", label: "join in" },
                ]}
                value={chat}
                onChange={(next) => setChat(next as ChatAccess)}
              />
            </div>

            <Button
              size="sm"
              className="w-fit"
              onClick={create}
              disabled={createLink.isPending}
            >
              <Link2 />
              {createLink.isPending ? "Creating…" : "Create link"}
            </Button>

            {createLink.isError && (
              <p role="alert" className="text-[12px] text-destructive">
                {createLink.error.message}
              </p>
            )}
          </div>
        )}

        <Separator />

        <div className="flex flex-col gap-2">
          <span className="eyebrow">
            Active links {list.length > 0 && `· ${list.length}`}
          </span>

          {links.isPending ? (
            <FeedSkeleton rows={2} />
          ) : list.length === 0 ? (
            <p className="py-2 text-[12.5px] text-muted-foreground">
              No links yet. This document is visible to workspace members only.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border/60">
              {list.map((link) => (
                <li key={link.id} className="flex items-center gap-3 py-2">
                  <Globe className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px]">
                      Anyone with the link can{" "}
                      {link.role === "editor" ? "edit" : "read"}
                    </span>
                    <span className="block truncate text-[11.5px] text-muted-foreground">
                      {link.chatAccess === "none"
                        ? "Chat hidden"
                        : link.chatAccess === "read"
                          ? "Can read chat"
                          : "Can join chat"}
                      {" · "}
                      {link.expiresAt
                        ? `Expires ${new Date(link.expiresAt).toLocaleDateString()}`
                        : "No expiry"}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Revoke link"
                    disabled={revokeLink.isPending}
                    onClick={() => revokeLink.mutate(link.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
      {options.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          size="xs"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "font-normal",
            value === option.value
              ? "bg-accent font-medium text-foreground"
              : "text-muted-foreground"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
