import { RedirectIfSignedIn } from "@/lib/session-gate";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <RedirectIfSignedIn>{children}</RedirectIfSignedIn>;
}
