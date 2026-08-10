import { RequireSession } from "@/lib/session-gate";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return <RequireSession>{children}</RequireSession>;
}
