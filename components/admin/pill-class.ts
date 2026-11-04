import { cn } from "@/lib/utils"

// One look for filter pills, shared by client buttons and server-rendered links.
export function pillClass(active: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
    active
      ? "border-accent bg-accent/15 text-foreground"
      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
  )
}
