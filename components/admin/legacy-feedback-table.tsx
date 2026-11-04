"use client"

import { Star } from "lucide-react"
import type { LegacyFeedbackKind, LegacyFeedbackRow } from "@/lib/legacy-records"
import { formatDate, formatDateTime, timestampValue } from "@/lib/format"
import { DataTable, type DataTableColumn, type DataTableDetail, type DataTableFilter } from "./data-table"
import { DetailAnswer, DetailAnswers, DetailFact, DetailFacts, DetailQuote, DetailSection } from "./detail-parts"
import { PersonCell } from "./person-cell"
import { StatusBadge, type StatusTone } from "./status-badge"

const kinds: Record<LegacyFeedbackKind, { label: string; tone: StatusTone }> = {
  day1: { label: "Day 1 reflection", tone: "warning" },
  final: { label: "Final feedback", tone: "accent" },
}

function KindBadge({ kind }: { kind: LegacyFeedbackKind }) {
  return <StatusBadge tone={kinds[kind].tone} dot>{kinds[kind].label}</StatusBadge>
}

function Rating({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>
  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <Star aria-hidden className="size-3.5 fill-amber-400 text-amber-400" />
      {value}/5
    </span>
  )
}

function TestimonialBadge({ row }: { row: LegacyFeedbackRow }) {
  if (!row.testimonial) return <span className="text-muted-foreground">—</span>
  return row.canUseTestimonial
    ? <StatusBadge tone="success">Can use publicly</StatusBadge>
    : <StatusBadge tone="neutral">Private</StatusBadge>
}

const columns: DataTableColumn<LegacyFeedbackRow>[] = [
  { id: "participant", header: "Participant", sortValue: (row) => row.name, cell: (row) => <PersonCell name={row.name} subtitle={row.email} /> },
  { id: "kind", header: "Type", sortValue: (row) => kinds[row.kind].label, cell: (row) => <KindBadge kind={row.kind} /> },
  { id: "rating", header: "Rating", className: "hidden sm:table-cell", sortValue: (row) => row.rating, cell: (row) => <Rating value={row.rating} /> },
  { id: "testimonial", header: "Testimonial", className: "hidden xl:table-cell", cell: (row) => <TestimonialBadge row={row} /> },
  { id: "submitted", header: "Submitted", className: "hidden whitespace-nowrap sm:table-cell", sortValue: (row) => timestampValue(row.submittedAt),
    cell: (row) => <span className="text-muted-foreground">{formatDate(row.submittedAt)}</span> },
]

const filter: DataTableFilter<LegacyFeedbackRow> = {
  label: "Filter by feedback type",
  options: [{ value: "final", label: "Final feedback" }, { value: "day1", label: "Day 1 reflections" }],
  getValue: (row) => row.kind,
}

const searchText = (row: LegacyFeedbackRow) =>
  [row.name, row.email, kinds[row.kind].label, row.mostValuable, row.decision, row.unclear, row.testimonial].join(" ")

const detail: DataTableDetail<LegacyFeedbackRow> = {
  title: (row) => row.name,
  description: (row) => (
    <>
      {row.email && <><a href={`mailto:${row.email}`} className="text-accent-bright underline-offset-4 hover:underline">{row.email}</a> &middot; </>}
      Submitted {formatDateTime(row.submittedAt)}
    </>
  ),
  badge: (row) => <KindBadge kind={row.kind} />,
  content: (row) => (
    <>
      <DetailSection>
        <DetailFacts>
          <DetailFact label="Rating"><Rating value={row.rating} /></DetailFact>
          <DetailFact label="Type">{kinds[row.kind].label}</DetailFact>
        </DetailFacts>
      </DetailSection>
      <DetailSection title="Feedback">
        <DetailAnswers>
          <DetailAnswer label="Most valuable" value={row.mostValuable} />
          <DetailAnswer label="One big decision" value={row.decision} />
          <DetailAnswer label="What was unclear" value={row.unclear} />
        </DetailAnswers>
      </DetailSection>
      {row.testimonial && (
        <DetailSection title="Testimonial">
          <DetailQuote>{row.testimonial}</DetailQuote>
          <p>{row.canUseTestimonial
            ? <StatusBadge tone="success">Can use publicly</StatusBadge>
            : <StatusBadge tone="neutral">Not cleared for public use</StatusBadge>}</p>
        </DetailSection>
      )}
    </>
  ),
}

export function LegacyFeedbackTable({ rows }: { rows: LegacyFeedbackRow[] }) {
  return (
    <DataTable
      caption="2026 participant feedback"
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      searchText={searchText}
      searchPlaceholder="Search feedback…"
      searchLabel="Search feedback by name, email, or comment"
      filter={filter}
      pageSize={25}
      emptyMessage="No feedback submitted yet"
      detail={detail}
    />
  )
}
