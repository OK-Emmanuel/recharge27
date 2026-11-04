"use client"

import { attendanceDays, type AttendanceRow } from "@/lib/legacy-records"
import { EMPTY_VALUE, formatDateTime, timestampValue } from "@/lib/format"
import { DataTable, type DataTableColumn, type DataTableDetail, type DataTableFilter } from "./data-table"
import { DetailAnswer, DetailAnswers, DetailFact, DetailFacts, DetailSection } from "./detail-parts"
import { PersonCell } from "./person-cell"
import { StatusBadge } from "./status-badge"

const dayLabel = (row: AttendanceRow) => row.day === null ? EMPTY_VALUE : `Day ${row.day}`

function DayBadge({ row }: { row: AttendanceRow }) {
  return <StatusBadge tone={row.day === 1 ? "success" : row.day === 2 ? "info" : "neutral"} dot>{dayLabel(row)}</StatusBadge>
}

const columns: DataTableColumn<AttendanceRow>[] = [
  { id: "participant", header: "Participant", sortValue: (row) => row.name, cell: (row) => <PersonCell name={row.name} subtitle={row.email} /> },
  { id: "day", header: "Day", sortValue: (row) => row.day, cell: (row) => <DayBadge row={row} /> },
  { id: "checkedIn", header: "Checked in", className: "hidden whitespace-nowrap sm:table-cell", sortValue: (row) => timestampValue(row.checkedInAt),
    cell: (row) => <span className="text-muted-foreground">{formatDateTime(row.checkedInAt)}</span> },
  { id: "reflection", header: "Reflection", className: "hidden xl:table-cell",
    cell: (row) => <p className="line-clamp-2 max-w-md text-muted-foreground">{row.reflection || "—"}</p> },
]

const filter: DataTableFilter<AttendanceRow> = {
  label: "Filter by day",
  options: [{ value: "1", label: "Day 1" }, { value: "2", label: "Day 2" }],
  getValue: (row) => String(row.day),
}

const searchText = (row: AttendanceRow) => [row.name, row.email, dayLabel(row), row.reflection].join(" ")

const detail: DataTableDetail<AttendanceRow> = {
  title: (row) => row.name,
  description: (row) => row.email ? <a href={`mailto:${row.email}`} className="text-accent-bright underline-offset-4 hover:underline">{row.email}</a> : null,
  badge: (row) => <DayBadge row={row} />,
  content: (row) => (
    <>
      <DetailSection title="Check-in">
        <DetailFacts>
          <DetailFact label="Event day">{row.day === null ? EMPTY_VALUE : `Day ${row.day}${attendanceDays[row.day] ? ` (${attendanceDays[row.day]})` : ""}`}</DetailFact>
          <DetailFact label="Checked in">{formatDateTime(row.checkedInAt)}</DetailFact>
        </DetailFacts>
      </DetailSection>
      <DetailSection title="Reflection">
        <DetailAnswers>
          <DetailAnswer label="Shared at check-in" value={row.reflection} />
        </DetailAnswers>
      </DetailSection>
    </>
  ),
}

export function AttendanceTable({ rows }: { rows: AttendanceRow[] }) {
  return (
    <DataTable
      caption="2026 attendance check-ins"
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      searchText={searchText}
      searchPlaceholder="Search check-ins…"
      searchLabel="Search check-ins by name, email, or reflection"
      filter={filter}
      pageSize={25}
      emptyMessage="No check-ins recorded yet"
      detail={detail}
    />
  )
}
