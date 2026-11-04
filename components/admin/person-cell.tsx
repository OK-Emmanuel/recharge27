import { UserX } from "lucide-react"
import { initials } from "@/lib/format"

// Name with an optional second line. Inline elements only: the first table column sits inside a button.
export function PersonCell({ name, subtitle, anonymous = false }: {
  name: string
  subtitle?: string | null
  anonymous?: boolean
}) {
  return (
    <span className="flex max-w-[12rem] items-center gap-3 sm:max-w-[18rem]">
      <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/25 text-xs font-semibold text-foreground max-sm:hidden">
        {anonymous ? <UserX className="size-4" /> : initials(name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium text-foreground">{name}</span>
        {subtitle && <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>}
      </span>
    </span>
  )
}
