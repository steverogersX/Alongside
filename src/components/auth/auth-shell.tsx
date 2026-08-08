import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center overflow-y-auto p-4">
      <div className="w-full max-w-[26rem]">
        <div className="rounded-2xl border border-sidebar-border bg-sidebar p-7 shadow-sm">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-foreground text-[11px] font-semibold text-background">
              A
            </span>
            <span className="text-[13px] font-medium">Alongside</span>
          </Link>

          <h1 className="mt-6 text-[22px] font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>

          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-4 text-center text-[12.5px] text-muted-foreground">
          {footer}
        </p>
      </div>
    </div>
  );
}
