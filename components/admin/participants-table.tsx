"use client"

import { useMemo } from "react"
import type { ParticipantRow } from "@/lib/legacy-records"
import { DataTable, type DataTableColumn, type DataTableDetail, type DataTableFilter } from "./data-table"
import { DetailFact, DetailFacts, DetailSection } from "./detail-parts"
import { PersonCell } from "./person-cell"
import { StatusBadge } from "./status-badge"

const statusLabel = (status: string) => status[0].toUpperCase() + status.slice(1)

function StatusPill({ status }: { status: string }) {
  return <StatusBadge tone={status === "confirmed" ? "success" : "warning"} dot>{statusLabel(status)}</StatusBadge>
}

function RolePill({ isAdmin }: { isAdmin: boolean }) {
  return isAdmin ? <StatusBadge tone="accent">Admin</StatusBadge> : <span className="text-muted-foreground">Participant</span>
}

const columns: DataTableColumn<ParticipantRow>[] = [
  { id: "participant", header: "Participant", sortValue: (row) => row.name, cell: (row) => <PersonCell name={row.name} subtitle={row.email} /> },
  { id: "status", header: "Status", sortValue: (row) => row.status, cell: (row) => <StatusPill status={row.status} /> },
  { id: "role", header: "Role", className: "hidden sm:table-cell", sortValue: (row) => row.isAdmin ? "Admin" : "Participant", cell: (row) => <RolePill isAdmin={row.isAdmin} /> },
]

const searchText = (row: ParticipantRow) => [row.name, row.email, row.status, row.isAdmin ? "admin" : "participant"].join(" ")

const detail: DataTableDetail<ParticipantRow> = {
  title: (row) => row.name,
  description: (row) => row.email ? <a href={`mailto:${row.email}`} className="text-accent-bright underline-offset-4 hover:underline">{row.email}</a> : null,
  badge: (row) => <StatusPill status={row.status} />,
  content: (row) => (
    <DetailSection title="Profile">
      <DetailFacts>
        <DetailFact label="Full name">{row.name}</DetailFact>
        <DetailFact label="Email">{row.email || "—"}</DetailFact>
        <DetailFact label="Status"><StatusPill status={row.status} /></DetailFact>
        <DetailFact label="Role"><RolePill isAdmin={row.isAdmin} /></DetailFact>
        <DetailFact label="Participant ID" wide><span className="font-mono text-xs">{row.id}</span></DetailFact>
      </DetailFacts>
    </DetailSection>
  ),
}

export function ParticipantsTable({ rows }: { rows: ParticipantRow[] }) {
  // The statuses come from the data, so the filter only offers values that exist.
  const filter = useMemo<DataTableFilter<ParticipantRow> | undefined>(() => {
    const statuses = [...new Set(rows.map((row) => row.status))].sort()
    return statuses.length > 1
      ? { label: "Filter by status", options: statuses.map((status) => ({ value: status, label: statusLabel(status) })), getValue: (row) => row.status }
      : undefined
  }, [rows])

  return (
    <DataTable
      caption="2026 participants"
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      searchText={searchText}
      searchPlaceholder="Search participants…"
      searchLabel="Search participants by name, email, or status"
      filter={filter}
      pageSize={25}
      emptyMessage="No participants found"
      detail={detail}
    />
  )
}
