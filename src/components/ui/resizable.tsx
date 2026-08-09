"use client"

import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "group relative flex w-2 shrink-0 items-center justify-center bg-transparent outline-none",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2",
        "aria-[orientation=horizontal]:h-2 aria-[orientation=horizontal]:w-full",
        "[&[aria-orientation=horizontal]_[data-grip]]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <span
          data-grip
          className={cn(
            "z-10 grid h-7 w-3.5 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-xs",
            "opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
            "group-data-[dragging]:opacity-100 group-data-[dragging]:border-ring group-data-[dragging]:text-foreground"
          )}
        >
          <GripVertical className="size-3" />
        </span>
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
