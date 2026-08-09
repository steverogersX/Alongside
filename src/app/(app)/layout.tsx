import { redirect } from "next/navigation";

import { SessionProvider } from "@/lib/session-provider";
import { getSession } from "@/lib/session";

// The session is read per request, so this cannot be prerendered.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getSession();
  if (!user) redirect("/login");

  return <SessionProvider user={user}>{children}</SessionProvider>;
}
