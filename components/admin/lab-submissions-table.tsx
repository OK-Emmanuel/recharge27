"use client"

import type { LabKind, LabRow } from "@/lib/lab-audits"
import { formatDate, formatDateTime, timestampValue } from "@/lib/format"
import { DataTable, type DataTableColumn, type DataTableDetail, type DataTableFilter } from "./data-table"
import { DetailAnswer, DetailAnswers, DetailFact, DetailFacts, DetailSection } from "./detail-parts"
import { PersonCell } from "./person-cell"
import { StatusBadge, type StatusTone } from "./status-badge"

const kinds: Record<LabKind, { label: string; tone: StatusTone }> = {
  health: { label: "Health assessment", tone: "success" },
  brand: { label: "Brand audit", tone: "info" },
  offer: { label: "Offer definition", tone: "accent" },
}

function KindBadge({ kind }: { kind: LabKind }) {
  return <StatusBadge tone={kinds[kind].tone} dot>{kinds[kind].label}</StatusBadge>
}

const columns: DataTableColumn<LabRow>[] = [
  { id: "participant", header: "Participant", sortValue: (row) => row.name, cell: (row) => <PersonCell name={row.name} subtitle={row.email} /> },
  { id: "kind", header: "Submission", sortValue: (row) => kinds[row.kind].label, cell: (row) => <KindBadge kind={row.kind} /> },
  { id: "summary", header: "Key output", className: "hidden xl:table-cell",
    cell: (row) => <p className="line-clamp-2 max-w-md text-muted-foreground">{row.summary || "—"}</p> },
  { id: "updated", header: "Updated", className: "hidden whitespace-nowrap sm:table-cell", sortValue: (row) => timestampValue(row.submittedAt),
    cell: (row) => <span className="text-muted-foreground">{formatDate(row.submittedAt)}</span> },
]

const filter: DataTableFilter<LabRow> = {
  label: "Filter by submission type",
  options: [
    { value: "health", label: "Health" },
    { value: "brand", label: "Brand" },
    { value: "offer", label: "Offer" },
  ],
  getValue: (row) => row.kind,
}

const searchText = (row: LabRow) => [
  row.name, row.email, kinds[row.kind].label, row.summary,
  ...row.facts.map((item) => item.value),
  ...row.highlights.map((item) => item.value),
  ...row.sections.flatMap((section) => section.items.map((item) => item.value)),
].join(" ")

function LabDetail({ row }: { row: LabRow }) {
  const empty = !row.facts.length && !row.highlights.length && !row.sections.length
  return (
    <>
      {row.facts.length > 0 && (
        <DetailSection title="Assessment">
          <DetailFacts>
            {row.facts.map((fact, index) => <DetailFact key={`${index}-${fact.label}`} label={fact.label}>{fact.value}</DetailFact>)}
          </DetailFacts>
        </DetailSection>
      )}
      {row.highlights.length > 0 && (
        <DetailSection title="Key outputs">
          <DetailAnswers>
            {row.highlights.map((item, index) => <DetailAnswer key={`${index}-${item.label}`} label={item.label} value={item.value} highlight />)}
          </DetailAnswers>
        </DetailSection>
      )}
      {row.sections.map((section) => (
        <DetailSection key={section.title} title={section.title}>
          <DetailAnswers>
            {section.items.map((item, index) => <DetailAnswer key={`${index}-${item.label}`} label={item.label} value={item.value} />)}
          </DetailAnswers>
        </DetailSection>
      ))}
      {empty && <p className="text-sm text-muted-foreground">This submission has no answers.</p>}
    </>
  )
}

const detail: DataTableDetail<LabRow> = {
  title: (row) => row.name,
  description: (row) => (
    <>
      {row.email && <><a href={`mailto:${row.email}`} className="text-accent-bright underline-offset-4 hover:underline">{row.email}</a> &middot; </>}
      Updated {formatDateTime(row.submittedAt)}
    </>
  ),
  badge: (row) => <KindBadge kind={row.kind} />,
  content: (row) => <LabDetail row={row} />,
}

export function LabSubmissionsTable({ rows }: { rows: LabRow[] }) {
  return (
    <DataTable
      caption="2026 lab submissions"
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      searchText={searchText}
      searchPlaceholder="Search submissions…"
      searchLabel="Search submissions by name, email, or answer"
      filter={filter}
      pageSize={25}
      emptyMessage="No lab submissions yet"
      detail={detail}
    />
  )
}
