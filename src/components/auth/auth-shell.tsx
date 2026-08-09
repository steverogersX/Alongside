import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/logo";
import { ClaimBoard } from "@/motion/auth/claim-board";

/**
 * The left half is the product doing its job: an agent working through a
 * contract, handing each paragraph back with its name on it. That is the whole
 * pitch, so it gets the space and the form stays plain beside it.
 */
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
    <div className="blueprint min-h-svh overflow-y-auto bg-background">
      <div className="mx-auto grid min-h-svh w-full max-w-6xl items-center gap-16 px-6 py-12 lg:grid-cols-[1.05fr_26rem] lg:gap-20 lg:px-10">
        <section className="hidden flex-col lg:flex">
          <Link href="/" className="inline-flex w-fit items-center gap-2.5">
            <Logo />
            <span className="text-[15px] font-semibold tracking-[-0.02em]">
              Alongside
            </span>
          </Link>

          <p className="eyebrow mt-14">Live in the room</p>
          <h2 className="display mt-3 max-w-md text-[30px] text-balance">
            Agents work in the document, and sign what they touch.
          </h2>

          <div className="mt-12">
            <ClaimBoard />
          </div>
        </section>

        <section className="w-full max-w-[26rem] justify-self-center lg:justify-self-end">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 lg:hidden"
            aria-label="Alongside home"
          >
            <Logo />
            <span className="text-[15px] font-semibold tracking-[-0.02em]">
              Alongside
            </span>
          </Link>

          <div className="mt-6 rounded-xl border border-border bg-card p-7 shadow-sm lg:mt-0">
            <h1 className="title text-[22px]">{title}</h1>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
              {subtitle}
            </p>

            <div className="mt-7">{children}</div>
          </div>

          <p className="mt-4 text-center text-[13px] text-muted-foreground">
            {footer}
          </p>
        </section>
      </div>
    </div>
  );
}
