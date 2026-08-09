"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { keys } from "@/lib/queries";
import type { SessionUser } from "@/lib/auth";

const SessionContext = createContext<SessionUser | null>(null);

/**
 * The account, read once by the layout on the server. Client components get it
 * without a request of their own, and the query cache is seeded with the same
 * value so anything already calling useSession() is a hit rather than a fetch.
 */
export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const client = useQueryClient();

  // Seeded during render, not in an effect: an effect would let the first paint
  // go out with an empty cache and refetch what the server already knows.
  if (client.getQueryData(keys.session) === undefined) {
    client.setQueryData(keys.session, { user });
  }

  return (
    <SessionContext value={user}>{children}</SessionContext>
  );
}

/** The signed-in account. Only valid inside a server-gated layout. */
export function useCurrentUser() {
  const user = useContext(SessionContext);
  if (!user) throw new Error("useCurrentUser used outside SessionProvider");
  return user;
}
