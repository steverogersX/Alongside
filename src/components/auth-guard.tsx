"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { BrandPulse } from "@/components/skeletons";
import { useSession } from "@/lib/queries";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isPending, isError } = useSession();

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  if (isPending) return <BrandPulse label="Signing you in" />;

  if (!data) return null;

  return <>{children}</>;
}
