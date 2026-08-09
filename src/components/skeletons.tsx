import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const widths = ["w-full", "w-[92%]", "w-[84%]", "w-[96%]", "w-[70%]"];

export function RowsSkeleton({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("divide-y divide-border/60", className)}
    >
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-2.5 py-3">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-40 max-w-[45%]" />
            <Skeleton className="h-2.5 w-64 max-w-[70%]" />
          </div>
          <Skeleton className="h-2.5 w-14 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function TilesSkeleton({ tiles = 3 }: { tiles?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading workspaces"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: tiles }, (_, index) => (
        <div
          key={index}
          className="flex min-h-[9.5rem] flex-col rounded-lg border border-border p-4"
        >
          <Skeleton className="size-10 rounded-md" />
          <Skeleton className="mt-3.5 h-3.5 w-32 max-w-[60%]" />
          <Skeleton className="mt-2 h-2.5 w-full max-w-[85%]" />
          <Skeleton className="mt-auto h-2.5 w-20" />
        </div>
      ))}
    </div>
  );
}

export function DocumentSkeleton() {
  return (
    <div role="status" aria-label="Loading document" className="flex flex-col">
      <Skeleton className="h-8 w-3/5 rounded-lg" />

      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-2.5 w-32" />
      </div>

      <div className="mt-10 flex flex-col gap-6">
        {[0, 1, 2].map((block) => (
          <div key={block} className="flex flex-col gap-2.5">
            {widths.slice(0, block === 1 ? 5 : 4).map((width, line) => (
              <Skeleton key={line} className={cn("h-3.5", width)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div role="status" aria-label="Loading messages" className="flex flex-col gap-4 py-3">
      {[0, 1, 2].map((message) => (
        <div key={message} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          <Skeleton
            className={cn("h-10 rounded-lg", message === 1 ? "w-[85%]" : "w-full")}
          />
        </div>
      ))}
    </div>
  );
}

export function FeedSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-3.5">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex gap-2.5">
          <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-full max-w-[80%]" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkspaceHeaderSkeleton() {
  return (
    <div role="status" aria-label="Loading workspace" className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <Skeleton className="size-12 shrink-0 rounded-xl" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-52 max-w-[55%]" />
          <Skeleton className="h-3 w-80 max-w-[75%]" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center">
          {[0, 1, 2].map((index) => (
            <Skeleton
              key={index}
              className="-mr-1.5 size-6 rounded-full last:mr-0"
            />
          ))}
        </div>
        <Skeleton className="h-2.5 w-28" />
      </div>
    </div>
  );
}

export function PeopleSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-2.5">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-2.5">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <Skeleton className="h-2.5 flex-1" style={{ maxWidth: `${72 - index * 8}%` }} />
        </div>
      ))}
    </div>
  );
}

export function BrandPulse({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-svh flex-col items-center justify-center gap-3"
    >
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="animate-agent-pulse size-1.5 rounded-full bg-agent"
            style={{ animationDelay: `${index * 180}ms` }}
          />
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
