import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default async function LinkUnavailablePage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="blueprint flex h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <Logo />

        <h1 className="title mt-6 text-[22px]">
          This link doesn&rsquo;t work
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
          {reason ?? "The link is no longer valid"}. It may have been revoked,
          or it expired. Ask whoever shared it for a new one.
        </p>

        <Button asChild variant="outline" className="mt-6">
          <Link href="/">Go to Alongside</Link>
        </Button>
      </div>
    </div>
  );
}
