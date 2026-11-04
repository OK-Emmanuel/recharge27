import type * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const tones = {
  neutral: "border-border bg-muted text-muted-foreground",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  danger: "border-red-400/30 bg-red-500/10 text-red-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  accent: "border-accent/40 bg-accent/10 text-accent-bright",
} as const

export type StatusTone = keyof typeof tones

export function StatusBadge({ tone = "neutral", dot = false, className, children, ...props }:
  React.ComponentProps<"span"> & { tone?: StatusTone; dot?: boolean }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 rounded-full px-2.5 py-0.5", tones[tone], className)} {...props}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </Badge>
  )
}
