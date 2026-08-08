"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/lib/queries";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isPending, isError } = useSession();

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  if (isPending) {
    return (
      <div className="flex h-svh items-center justify-center">
        <span className="animate-agent-pulse size-2 rounded-full bg-agent" />
      </div>
    );
  }

  if (!data) return null;

  return <>{children}</>;
}
