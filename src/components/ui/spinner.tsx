import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

function Spinner({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <>
      <LoaderCircle
        data-slot="spinner"
        aria-hidden
        className={cn("size-3.5 animate-spin", className)}
      />
      {label && <span className="sr-only">{label}</span>}
    </>
  );
}

export { Spinner };
