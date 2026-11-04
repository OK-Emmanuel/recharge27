"use client"

import { useEffect, useRef, useState } from "react"
import { ImageIcon } from "lucide-react"
import type { UpdateRow } from "@/lib/legacy-records"
import { formatDate, formatDateTime, safeHref, timestampValue } from "@/lib/format"
import { DataTable, type DataTableColumn, type DataTableDetail, type DataTableFilter } from "./data-table"
import { DetailFact, DetailFacts, DetailLink, DetailSection } from "./detail-parts"
import { StatusBadge, type StatusTone } from "./status-badge"
import { TextCell } from "./text-cell"

const statuses: Record<string, { label: string; tone: StatusTone }> = {
  upcoming: { label: "Upcoming", tone: "info" },
  ongoing: { label: "Ongoing", tone: "success" },
  past: { label: "Past", tone: "neutral" },
}

function statusOf(row: UpdateRow) {
  return Object.hasOwn(statuses, row.status)
    ? statuses[row.status]
    : { label: row.status[0].toUpperCase() + row.status.slice(1), tone: "neutral" as const }
}

function StatusPill({ row }: { row: UpdateRow }) {
  return <StatusBadge tone={statusOf(row).tone} dot>{statusOf(row).label}</StatusBadge>
}

// A missing or unreachable image falls back to the empty frame rather than a broken-image icon.
function Picture({ src, className }: { src: string; className: string }) {
  const safe = safeHref(src)
  const image = useRef<HTMLImageElement>(null)
  const [failed, setFailed] = useState<string | null>(null)
  // The image can fail before hydration attaches onError, so check again once it is mounted.
  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth === 0) setFailed(safe ?? null)
  }, [safe])
  return safe && failed !== safe
    ? <img ref={image} src={safe} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(safe)} className={`${className} object-cover`} />
    : <span aria-hidden className={`${className} flex items-center justify-center`}><ImageIcon className="size-4 text-muted-foreground" /></span>
}

const columns: DataTableColumn<UpdateRow>[] = [
  { id: "update", header: "Update", sortValue: (row) => row.title,
    cell: (row) => (
      <span className="flex items-center gap-3">
        <Picture src={row.image} className="h-9 w-16 shrink-0 rounded-md border border-border bg-muted max-sm:hidden" />
        <TextCell title={row.title} subtitle={row.slug ? `/${row.slug}` : null} className="max-w-[10rem] sm:max-w-[14rem] xl:max-w-[18rem]" />
      </span>
    ) },
  { id: "status", header: "Status", sortValue: (row) => statusOf(row).label, cell: (row) => <StatusPill row={row} /> },
  { id: "eventDate", header: "Event date", className: "hidden whitespace-nowrap sm:table-cell", sortValue: (row) => timestampValue(row.eventDate),
    cell: (row) => <span className="text-muted-foreground">{formatDate(row.eventDate)}</span> },
]

const filter: DataTableFilter<UpdateRow> = {
  label: "Filter by status",
  options: [{ value: "upcoming", label: "Upcoming" }, { value: "ongoing", label: "Ongoing" }, { value: "past", label: "Past" }],
  getValue: (row) => row.status,
}

const searchText = (row: UpdateRow) =>
  [row.title, row.slug, row.excerpt, row.description, row.status, ...row.buttons.map((button) => button.label)].join(" ")

const detail: DataTableDetail<UpdateRow> = {
  title: (row) => row.title,
  description: (row) => row.slug ? <span className="font-mono text-xs">/{row.slug}</span> : null,
  badge: (row) => <StatusPill row={row} />,
  content: (row) => (
    <>
      {safeHref(row.image) && <Picture src={row.image} className="aspect-video w-full rounded-lg border border-border bg-muted" />}
      {row.excerpt && <p className="text-sm leading-relaxed break-words text-muted-foreground">{row.excerpt}</p>}
      <DetailSection title="Details">
        <DetailFacts>
          <DetailFact label="Event date and time">{formatDateTime(row.eventDate)}</DetailFact>
          <DetailFact label="Status">{statusOf(row).label}</DetailFact>
          <DetailFact label="Created">{formatDateTime(row.createdAt)}</DetailFact>
          <DetailFact label="Created by">{row.createdBy || "—"}</DetailFact>
        </DetailFacts>
      </DetailSection>
      <DetailSection title="Description">
        <div className="space-y-3 text-sm leading-relaxed break-words text-foreground">
          {row.description
            ? row.description.split(/\n{2,}/).map((paragraph, index) => <p key={index} className="whitespace-pre-wrap">{paragraph}</p>)
            : <p className="text-muted-foreground">No description.</p>}
        </div>
      </DetailSection>
      <DetailSection title="Call-to-action buttons">
        {row.buttons.length === 0 ? <p className="text-sm text-muted-foreground">No buttons.</p> : (
          <ul className="space-y-2">
            {row.buttons.map((button, index) => (
              <li key={`${index}-${button.label}`} className="rounded-lg border border-border bg-background/50 px-3.5 py-2.5 text-sm">
                <p className="font-medium text-foreground">{button.label}</p>
                <p className="text-xs text-muted-foreground"><DetailLink href={button.href}>{button.href || "No link"}</DetailLink></p>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>
    </>
  ),
}

export function UpdatesTable({ rows }: { rows: UpdateRow[] }) {
  return (
    <DataTable
      caption="Public updates"
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      searchText={searchText}
      searchPlaceholder="Search updates…"
      filter={filter}
      pageSize={25}
      emptyMessage="No updates yet. Create your first update above."
      detail={detail}
    />
  )
}
