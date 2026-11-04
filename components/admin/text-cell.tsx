import { cn } from "@/lib/utils"

// Title with an optional second line. Inline elements only: the first table column sits inside a button.
export function TextCell({ title, subtitle, lines = 1, className }: {
  title: string
  subtitle?: string | null
  /** How many lines the title may use before it is cut off. */
  lines?: 1 | 2
  className?: string
}) {
  return (
    <span className={cn("block max-w-[12rem] sm:max-w-md", className)}>
      <span className={cn("block font-medium text-foreground", lines === 2 ? "line-clamp-2" : "truncate")}>{title}</span>
      {subtitle && <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>}
    </span>
  )
}
