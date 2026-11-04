"use client"

import type { FeedbackSection } from "@/lib/feedback-view"
import { formatDate, formatDateTime, timestampValue } from "@/lib/format"
import { DataTable, type DataTableColumn, type DataTableDetail, type DataTableFilter } from "./data-table"
import { DetailAnswer, DetailAnswers, DetailSection } from "./detail-parts"
import { PersonCell } from "./person-cell"
import { StatusBadge } from "./status-badge"

export type FeedbackRow = {
  id: string
  /** Null for anonymous contributions, so their identity never reaches the browser. */
  name: string | null
  email: string | null
  anonymity: "anonymous" | "identified"
  createdAt: string
  answerCount: number
  sections: FeedbackSection[]
}

const displayName = (row: FeedbackRow) => row.name ?? "Anonymous contribution"

function SharingBadge({ anonymity }: { anonymity: FeedbackRow["anonymity"] }) {
  return anonymity === "anonymous"
    ? <StatusBadge tone="neutral" dot>Anonymous</StatusBadge>
    : <StatusBadge tone="info" dot>Identified</StatusBadge>
}

const columns: DataTableColumn<FeedbackRow>[] = [
  { id: "contributor", header: "Contributor", sortValue: displayName,
    cell: (row) => <PersonCell name={displayName(row)} subtitle={row.email} anonymous={row.anonymity === "anonymous"} /> },
  { id: "sharing", header: "Sharing", sortValue: (row) => row.anonymity, cell: (row) => <SharingBadge anonymity={row.anonymity} /> },
  { id: "answers", header: "Answers", className: "hidden md:table-cell", sortValue: (row) => row.answerCount,
    cell: (row) => <span className="text-muted-foreground tabular-nums">{row.answerCount}</span> },
  { id: "submitted", header: "Submitted", className: "hidden whitespace-nowrap sm:table-cell", sortValue: (row) => timestampValue(row.createdAt),
    cell: (row) => <span className="text-muted-foreground">{formatDate(row.createdAt)}</span> },
]

const filter: DataTableFilter<FeedbackRow> = {
  label: "Filter by sharing preference",
  options: [{ value: "identified", label: "Identified" }, { value: "anonymous", label: "Anonymous" }],
  getValue: (row) => row.anonymity,
}

const searchText = (row: FeedbackRow) => [
  row.name, row.email, row.anonymity,
  ...row.sections.flatMap((section) => section.entries.map((entry) => Array.isArray(entry.value) ? entry.value.join(" ") : entry.value)),
].filter(Boolean).join(" ")

const detail: DataTableDetail<FeedbackRow> = {
  title: displayName,
  description: (row) => (
    <>
      {row.email && <><a href={`mailto:${row.email}`} className="text-accent-bright underline-offset-4 hover:underline">{row.email}</a> &middot; </>}
      Submitted {formatDateTime(row.createdAt)}
    </>
  ),
  badge: (row) => <SharingBadge anonymity={row.anonymity} />,
  content: (row) => row.sections.length === 0
    ? <p className="text-sm text-muted-foreground">No optional questions answered.</p>
    : (
      <>
        {row.sections.map((section) => (
          <DetailSection key={section.title} title={section.title}>
            <DetailAnswers>
              {section.entries.map((entry) => <DetailAnswer key={entry.key} label={entry.label} value={entry.value} />)}
            </DetailAnswers>
          </DetailSection>
        ))}
      </>
    ),
}

export function FeedbackTable({ rows }: { rows: FeedbackRow[] }) {
  return (
    <DataTable
      caption="2027 community feedback responses"
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      searchText={searchText}
      searchPlaceholder="Search this page…"
      searchLabel="Search responses on this page by name, email, or answer"
      filter={filter}
      emptyMessage="No feedback on this page."
      detail={detail}
    />
  )
}
