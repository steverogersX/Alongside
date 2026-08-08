import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm transition-[color,box-shadow] outline-none",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
