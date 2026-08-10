"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { SessionProvider } from "@/lib/session-provider";
import { useSession } from "@/lib/queries";

/**
 * The gate runs in the browser rather than on the server because the session
 * cookie belongs to the API's host, and a browser only sends it to that host.
 * Server-side rendering of this app never sees it, so a server gate would turn
 * every signed-in visit away. The API still enforces access on every request;
 * this only decides what to draw.
 */
export function RequireSession({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const user = session.data?.user;

  useEffect(() => {
    if (!session.isPending && !user) router.replace("/login");
  }, [session.isPending, user, router]);

  if (!user) return <ShellSkeleton />;

  return <SessionProvider user={user}>{children}</SessionProvider>;
}

/** Signed in already, so the form has nothing to ask. */
export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.data?.user) router.replace("/");
  }, [session.data, router]);

  return <>{children}</>;
}

function ShellSkeleton() {
  return (
    <div className="flex h-dvh flex-col" aria-busy="true">
      <div className="flex h-12 shrink-0 items-center gap-2 px-3">
        <div className="size-6 animate-pulse rounded-md bg-muted" />
        <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
        <div className="ml-auto size-7 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="flex-1 px-6 py-4">
        <div className="mx-auto grid w-full max-w-3xl gap-2">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
