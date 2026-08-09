import { cache } from "react";

import { serverGet } from "@/lib/api-server";
import type { SessionUser } from "@/lib/auth";

/**
 * Who is asking, according to the API. Null covers every way of not knowing —
 * no cookie, an expired one, or the API being unreachable. A gate that cannot
 * verify has to assume the worst; the alternative is letting a network blip
 * open the door.
 *
 * Cached for the request, so a layout and a page asking both cost one call.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  try {
    const { user } = await serverGet<{ user: SessionUser }>("/auth/me");
    return user;
  } catch {
    return null;
  }
});
