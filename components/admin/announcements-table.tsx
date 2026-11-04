"use client"

import type { AnnouncementRow } from "@/lib/legacy-records"
import { formatDate, formatDateTime, timestampValue } from "@/lib/format"
import { DataTable, type DataTableColumn, type DataTableDetail, type DataTableFilter } from "./data-table"
import { DetailFact, DetailFacts, DetailSection } from "./detail-parts"
import { StatusBadge, type StatusTone } from "./status-badge"
import { TextCell } from "./text-cell"

const priorities: Record<string, { label: string; tone: StatusTone; rank: number }> = {
  high: { label: "High", tone: "danger", rank: 0 },
  medium: { label: "Medium", tone: "accent", rank: 1 },
  low: { label: "Low", tone: "info", rank: 2 },
}

function priorityOf(row: AnnouncementRow) {
  return Object.hasOwn(priorities, row.priority)
    ? priorities[row.priority]
    : { label: row.priority[0].toUpperCase() + row.priority.slice(1), tone: "neutral" as const, rank: 3 }
}

function PriorityBadge({ row }: { row: AnnouncementRow }) {
  return <StatusBadge tone={priorityOf(row).tone} dot>{priorityOf(row).label}</StatusBadge>
}

const columns: DataTableColumn<AnnouncementRow>[] = [
  { id: "announcement", header: "Announcement", sortValue: (row) => row.title, cell: (row) => <TextCell title={row.title} subtitle={row.message} /> },
  { id: "priority", header: "Priority", sortValue: (row) => priorityOf(row).rank, cell: (row) => <PriorityBadge row={row} /> },
  { id: "posted", header: "Posted", className: "hidden whitespace-nowrap sm:table-cell", sortValue: (row) => timestampValue(row.postedAt),
    cell: (row) => <span className="text-muted-foreground">{formatDate(row.postedAt)}</span> },
]

const filter: DataTableFilter<AnnouncementRow> = {
  label: "Filter by priority",
  options: [{ value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }],
  getValue: (row) => row.priority,
}

const searchText = (row: AnnouncementRow) => [row.title, row.message, row.priority, row.postedBy].join(" ")

const detail: DataTableDetail<AnnouncementRow> = {
  title: (row) => row.title,
  description: (row) => <>Posted {formatDateTime(row.postedAt)}{row.postedBy ? <> by {row.postedBy}</> : null}</>,
  badge: (row) => <PriorityBadge row={row} />,
  content: (row) => (
    <>
      <DetailSection title="Message">
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-foreground">{row.message || "No message."}</p>
      </DetailSection>
      <DetailSection title="Details">
        <DetailFacts>
          <DetailFact label="Priority">{priorityOf(row).label}</DetailFact>
          <DetailFact label="Posted">{formatDateTime(row.postedAt)}</DetailFact>
          <DetailFact label="Posted by" wide>{row.postedBy || "—"}</DetailFact>
        </DetailFacts>
      </DetailSection>
    </>
  ),
}

export function AnnouncementsTable({ rows }: { rows: AnnouncementRow[] }) {
  return (
    <DataTable
      caption="Announcements"
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      searchText={searchText}
      searchPlaceholder="Search announcements…"
      filter={filter}
      pageSize={25}
      emptyMessage="No announcements yet. Post your first announcement above."
      detail={detail}
    />
  )
}
