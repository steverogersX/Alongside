import { notFound } from "next/navigation";
import { Globe, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { personAvatar } from "@/lib/avatars";
import { WORKSPACES, getWorkspace } from "@/lib/data";

export function generateStaticParams() {
  return WORKSPACES.map((ws) => ({ id: ws.id }));
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5">
      <div className="min-w-0">
        <span className="block text-[13px] font-medium">{label}</span>
        {hint && (
          <span className="mt-0.5 block text-[12px] text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default async function Page({ params }: PageProps<"/w/[id]/settings">) {
  const { id } = await params;
  const workspace = getWorkspace(id);

  if (!workspace) notFound();

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="eyebrow pb-1">General</h2>
        <div className="divide-y divide-border/60">
          <Field label="Name">
            <span className="text-[13px] text-muted-foreground">
              {workspace.name}
            </span>
          </Field>
          <Field label="Purpose" hint="Shown on the workspace card at home.">
            <span className="max-w-xs text-right text-[13px] text-muted-foreground">
              {workspace.purpose}
            </span>
          </Field>
          <Field
            label="Visibility"
            hint="Who can find and open this workspace."
          >
            <Badge variant="outline" className="gap-1 font-normal">
              <Lock />
              Invite only
            </Badge>
          </Field>
          <Field
            label="Agent autonomy"
            hint="Whether agents may write without a human accepting first."
          >
            <Badge variant="secondary" className="bg-agent/10 text-agent">
              Propose, never commit
            </Badge>
          </Field>
          <Field
            label="Discoverable in org"
            hint="Let anyone in the org request access."
          >
            <Badge variant="outline" className="gap-1 font-normal">
              <Globe />
              Off
            </Badge>
          </Field>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between pb-1">
          <h2 className="eyebrow">Members</h2>
          <Button variant="outline" size="xs">
            Invite
          </Button>
        </div>

        <div className="divide-y divide-border/60">
          {workspace.members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={personAvatar(member.id, member.kind, 48)}
                alt=""
                aria-hidden
                className={cn(
                  "size-7 shrink-0 select-none",
                  member.kind === "agent"
                    ? "rounded-md ring-1 ring-agent/25"
                    : "rounded-full"
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">
                  {member.name}
                </span>
                <span className="block truncate text-[11.5px] text-muted-foreground">
                  {member.kind === "agent" ? member.model : "Member"}
                </span>
              </span>
              <Badge variant="outline" className="font-normal">
                {member.kind === "agent" ? "Agent" : "Can edit"}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="eyebrow pb-1">Danger zone</h2>
        <Separator className="mb-3.5" />
        <div className="flex items-center justify-between gap-6">
          <div>
            <span className="block text-[13px] font-medium">
              Delete this workspace
            </span>
            <span className="mt-0.5 block text-[12px] text-muted-foreground">
              Removes every doc, thread, and agent seat. This cannot be undone.
            </span>
          </div>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      </section>
    </div>
  );
}
