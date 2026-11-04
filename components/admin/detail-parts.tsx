import type { ReactNode } from "react"
import { Check, ExternalLink } from "lucide-react"
import { safeHref } from "@/lib/format"
import { cn } from "@/lib/utils"

// Building blocks for the content of a DetailDrawer. They render the same on server and client.

export function DetailSection({ title, children, className }: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-3", className)}>
      {title && <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{title}</h3>}
      {children}
    </section>
  )
}

export function DetailFacts({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2", className)}>{children}</dl>
}

export function DetailFact({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn("min-w-0", wide && "sm:col-span-2")}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm break-words text-foreground">{children}</dd>
    </div>
  )
}

export function DetailAnswers({ children }: { children: ReactNode }) {
  return <dl className="space-y-4">{children}</dl>
}

// A question and its (possibly long) answer. Arrays are shown as a checked list, text keeps its line breaks.
export function DetailAnswer({ label, value, highlight = false }: {
  label: string
  value: string | string[] | null | undefined
  highlight?: boolean
}) {
  const items = Array.isArray(value) ? value : null
  const text = typeof value === "string" ? value.trim() : ""
  const empty = items ? items.length === 0 : !text
  return (
    <div>
      <dt className="mb-1.5 text-sm text-muted-foreground">{label}</dt>
      <dd className={cn(
        "rounded-lg border px-3.5 py-3 text-sm leading-relaxed break-words text-foreground",
        highlight ? "border-accent/40 bg-accent/5" : "border-border bg-background/50",
        empty && "text-muted-foreground italic",
      )}>
        {empty ? "No answer provided." : items ? (
          <ul className="space-y-1.5">
            {items.map((item, index) => (
              <li key={`${index}-${item}`} className="flex gap-2">
                <Check aria-hidden className="mt-1 size-3.5 shrink-0 text-accent-bright" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : <span className="whitespace-pre-wrap">{text}</span>}
      </dd>
    </div>
  )
}

export function DetailTags({ items, empty = "None selected." }: { items: readonly string[]; empty?: string }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{empty}</p>
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs text-foreground">{item}</li>
      ))}
    </ul>
  )
}

export function DetailQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-2 border-accent pl-4 text-sm leading-relaxed break-words whitespace-pre-wrap text-foreground italic">
      {children}
    </blockquote>
  )
}

// Stored URLs are only linked when they are web, mail, or same-site addresses.
export function DetailLink({ href, children }: { href: unknown; children?: ReactNode }) {
  const safe = safeHref(href)
  const label = children ?? (typeof href === "string" ? href : "")
  if (!safe) return <span className="break-all">{label}</span>
  const external = /^https?:/i.test(safe)
  return (
    <a
      href={safe}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex max-w-full items-start gap-1 break-all text-accent-bright underline-offset-4 hover:underline"
    >
      <span>{label}</span>
      {external && <ExternalLink aria-hidden className="mt-0.5 size-3.5 shrink-0" />}
    </a>
  )
}
