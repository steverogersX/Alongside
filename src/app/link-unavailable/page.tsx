import Link from "next/link";

import { Button } from "@/components/ui/button";

export default async function LinkUnavailablePage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="flex h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-[18px] font-semibold tracking-tight">
          This link doesn&rsquo;t work
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          {reason ?? "The link is no longer valid"}. It may have been revoked,
          or it expired. Ask whoever shared it for a new one.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-5">
          <Link href="/">Go to Alongside</Link>
        </Button>
      </div>
    </div>
  );
}
