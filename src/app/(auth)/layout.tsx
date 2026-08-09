import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Already signed in, so the form has nothing to ask. */
export default async function AuthLayout({ children }: LayoutProps<"/">) {
  if (await getSession()) redirect("/");

  return <>{children}</>;
}
