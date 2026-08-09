"use client";

import { useState } from "react";
import {
  Check,
  ChevronsUpDown,
  Eye,
  EyeOff,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PROVIDERS,
  ProviderMark,
  providerOf,
  type ProviderId,
} from "@/components/workspace/provider-mark";
import { useAddMember, useCreateAgent, useWorkspace } from "@/lib/queries";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const handleOf = (value: string) =>
  value.trim().split(/\s+/)[0]?.toLowerCase() ?? "";

export function AddAgentFlow({
  workspaceId,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("Claude");
  const [providerId, setProviderId] = useState<ProviderId>("anthropic");
  const [model, setModel] = useState(PROVIDERS[0]!.models[0]!);
  const [custom, setCustom] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [reveal, setReveal] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const workspace = useWorkspace(workspaceId);
  const createAgent = useCreateAgent();
  const addMember = useAddMember(workspaceId);

  const provider = providerOf(providerId);
  const working = createAgent.isPending || addMember.isPending;
  const handle = handleOf(name);

  const taken = (workspace.data?.members ?? []).some(
    (row) => row.user.kind === "bot" && handleOf(row.user.displayName) === handle
  );

  const error = createAgent.error?.message ?? addMember.error?.message ?? null;
  const ready = Boolean(handle) && Boolean(apiKey.trim()) && !taken;

  function pickProvider(next: ProviderId) {
    setProviderId(next);
    setModel(providerOf(next).models[0]!);
    setBaseUrl(providerOf(next).baseUrl ?? "");
    setCustom(false);
  }

  function reset() {
    onOpenChange(false);
    setDone(null);
    setApiKey("");
    setReveal(false);
    setCustom(false);
    setName("Claude");
  }

  function submit() {
    if (!ready) return;

    createAgent.mutate(
      {
        displayName: name.trim(),
        model: model.trim(),
        provider: providerId,
        apiKey: apiKey.trim(),
        ...(provider.needsBaseUrl && baseUrl.trim()
          ? { baseUrl: baseUrl.trim() }
          : {}),
      },
      {
        onSuccess: (result) =>
          addMember.mutate(
            { userId: result.agent.id, role },
            { onSuccess: () => setDone(name.trim()) }
          ),
      }
    );
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => onOpenChange(true)}
      >
        <Plus />
        Add an agent
      </Button>
    );
  }

  if (done) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-online/30 bg-online/5 p-3">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-online text-background">
          <Check className="size-3" strokeWidth={3} />
        </span>
        <span className="min-w-0 flex-1 text-[12px] leading-relaxed">
          <span className="font-medium">{done} is ready.</span> Type{" "}
          <span className="font-mono text-agent">@{handle}</span> in any
          document here.
        </span>
        <Button size="xs" onClick={reset} className="shrink-0">
          Done
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex items-end gap-2">
        <label className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            Name
          </span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Claude"
            aria-label="Agent name"
            aria-invalid={taken}
            autoFocus
            className="h-8"
          />
        </label>

        <div className="flex shrink-0 flex-col gap-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            Can
          </span>
          <div className="flex h-8 items-center gap-0.5 rounded-lg border border-border p-0.5">
            {(
              [
                { value: "viewer", label: "Read" },
                { value: "editor", label: "Write" },
              ] as const
            ).map((option) => (
              <Button
                key={option.value}
                type="button"
                variant="ghost"
                size="xs"
                aria-pressed={role === option.value}
                onClick={() => setRole(option.value)}
                className={cn(
                  "font-normal",
                  role === option.value
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <p
        className={cn(
          "-mt-1.5 text-[11px]",
          taken ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {taken ? (
          <>
            <span className="font-mono">@{handle}</span> is already taken in
            this workspace — pick another name.
          </>
        ) : (
          <>
            Mentioned as <span className="font-mono text-agent">@{handle}</span>
          </>
        )}
      </p>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-muted-foreground">
          Provider
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full justify-start gap-2 font-normal"
            >
              <ProviderMark provider={providerId} />
              <span className="flex-1 text-left">{provider.name}</span>
              <ChevronsUpDown className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
            {PROVIDERS.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onSelect={() => pickProvider(option.id)}
                className="gap-2"
              >
                <ProviderMark provider={option.id} />
                <span className="flex-1">{option.name}</span>
                {providerId === option.id && (
                  <Check className="size-3.5 text-muted-foreground" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {provider.models.map((option) => (
          <Button
            key={option}
            type="button"
            variant="ghost"
            size="xs"
            aria-pressed={!custom && model === option}
            onClick={() => {
              setModel(option);
              setCustom(false);
            }}
            className={cn(
              "border font-mono text-[11px] font-normal",
              !custom && model === option
                ? "border-foreground/20 bg-accent text-foreground"
                : "border-border text-muted-foreground"
            )}
          >
            {option}
          </Button>
        ))}

        <Button
          type="button"
          variant="ghost"
          size="xs"
          aria-pressed={custom}
          onClick={() => {
            setCustom(true);
            setModel("");
          }}
          className={cn(
            "border font-normal",
            custom
              ? "border-foreground/20 bg-accent text-foreground"
              : "border-dashed border-border text-muted-foreground"
          )}
        >
          Custom
        </Button>
      </div>

      {custom && (
        <Input
          value={model}
          onChange={(event) => setModel(event.target.value)}
          placeholder="model-id"
          aria-label="Model"
          className="h-8 font-mono text-[11.5px]"
        />
      )}

      {provider.needsBaseUrl && (
        <Input
          value={baseUrl}
          onChange={(event) => setBaseUrl(event.target.value)}
          placeholder="https://api.moonshot.cn/v1"
          aria-label="Base URL"
          className="h-8 font-mono text-[11.5px]"
        />
      )}

      <div className="flex items-center gap-1.5">
        <Input
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          type={reveal ? "text" : "password"}
          placeholder={`${provider.name} API key — ${provider.keyHint}`}
          aria-label="API key"
          autoComplete="off"
          spellCheck={false}
          className="h-8 font-mono text-[11.5px]"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={reveal ? "Hide key" : "Show key"}
          onClick={() => setReveal((value) => !value)}
          className="shrink-0 text-muted-foreground"
        >
          {reveal ? <EyeOff /> : <Eye />}
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-[12px] text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={working || !ready}>
          {working && <Spinner />}
          Add {name.trim() || "agent"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          Cancel
        </Button>

        <span className="ml-auto flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <ShieldCheck className="size-3 shrink-0 text-online" />
          Key is encrypted, never shown again
        </span>
      </div>
    </form>
  );
}
