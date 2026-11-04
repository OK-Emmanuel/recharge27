"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { DataTable, type DataTableColumn, type DataTableDetail, type DataTableFilter } from "@/components/admin/data-table"
import { DetailAnswer, DetailAnswers, DetailSection } from "@/components/admin/detail-parts"
import { PersonCell } from "@/components/admin/person-cell"
import { StatusBadge } from "@/components/admin/status-badge"
import { formatDate, formatDateTime, timestampValue } from "@/lib/format"
import { toHotSeatRow, type HotSeatRow } from "@/lib/legacy-records"

interface HotSeatsListProps {
  isAdmin: boolean
}

function SelectedBadge() {
  return <StatusBadge tone="accent"><Star className="fill-current" />Selected</StatusBadge>
}

const columns: DataTableColumn<HotSeatRow>[] = [
  { id: "participant", header: "Participant", sortValue: (row) => row.name, cell: (row) => <PersonCell name={row.name} subtitle={row.email} /> },
  { id: "challenge", header: "Challenge", className: "hidden md:table-cell",
    cell: (row) => <p className="line-clamp-2 max-w-md text-muted-foreground">{row.challenge || "—"}</p> },
  { id: "status", header: "Status", sortValue: (row) => row.selected ? 0 : 1,
    cell: (row) => row.selected ? <SelectedBadge /> : <span className="text-muted-foreground">Not selected</span> },
  { id: "submitted", header: "Submitted", className: "hidden whitespace-nowrap sm:table-cell", sortValue: (row) => timestampValue(row.submittedAt),
    cell: (row) => <span className="text-muted-foreground">{formatDate(row.submittedAt)}</span> },
]

const filter: DataTableFilter<HotSeatRow> = {
  label: "Filter by selection",
  options: [{ value: "selected", label: "Selected" }, { value: "open", label: "Not selected" }],
  getValue: (row) => row.selected ? "selected" : "open",
}

const searchText = (row: HotSeatRow) => [row.name, row.email, row.challenge, row.context, row.helpWanted].join(" ")

export default function HotSeatsList({ isAdmin }: HotSeatsListProps) {
  const [hotSeats, setHotSeats] = useState<HotSeatRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  useEffect(() => {
    fetchHotSeats()
    
    const handleUpdate = () => fetchHotSeats()
    window.addEventListener("hotSeatsUpdated", handleUpdate)
    
    return () => window.removeEventListener("hotSeatsUpdated", handleUpdate)
  }, [])

  const fetchHotSeats = async () => {
    setError(null)
    try {
      const res = await fetch("/api/portal/hot-seats")
      if (res.ok) {
        const data = await res.json()
        setHotSeats(Array.isArray(data.hotSeats) ? data.hotSeats.map(toHotSeatRow) : [])
      } else throw new Error(`Failed to load hot seats (${res.status})`)
    } catch (error) {
      console.error("Failed to fetch hot seats:", error)
      setError("Unable to load hot seats. Please retry.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSelect = async (hotSeatId: string) => {
    if (pendingId) return
    setPendingId(hotSeatId)
    try {
      const res = await fetch("/api/portal/hot-seats/toggle-select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotSeatId }),
      })

      if (res.ok) {
        await fetchHotSeats()
      } else throw new Error(`Failed to update selection (${res.status})`)
    } catch (error) {
      console.error("Failed to toggle selection:", error)
      setError("Unable to change this selection. Please retry.")
    } finally {
      setPendingId(null)
    }
  }

  if (loading) {
    return (
      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardContent className="py-8 text-center text-gray-400">
          Loading submissions...
        </CardContent>
      </Card>
    )
  }

  const detail: DataTableDetail<HotSeatRow> = {
    title: (row) => row.name,
    description: (row) => (
      <>
        {row.email && <><a href={`mailto:${row.email}`} className="text-accent-bright underline-offset-4 hover:underline">{row.email}</a> &middot; </>}
        Submitted {formatDateTime(row.submittedAt)}
      </>
    ),
    badge: (row) => row.selected ? <SelectedBadge /> : undefined,
    content: (row) => (
      <DetailSection title="Hot seat submission">
        <DetailAnswers>
          <DetailAnswer label="Challenge" value={row.challenge} highlight />
          <DetailAnswer label="Context" value={row.context} />
          <DetailAnswer label="Help wanted" value={row.helpWanted} />
        </DetailAnswers>
      </DetailSection>
    ),
    footer: isAdmin
      ? (row) => (
        <Button type="button" variant={row.selected ? "outline" : "default"} disabled={pendingId !== null} onClick={() => handleToggleSelect(row.id)}>
          {pendingId === row.id ? "Saving..." : row.selected ? "Unselect" : "Select for Hot Seat"}
        </Button>
      )
      : undefined,
  }

  return (
    <div className="space-y-4">
      {error && <div role="alert" className="text-danger">{error} <Button variant="outline" onClick={fetchHotSeats}>Retry</Button></div>}

      {error && hotSeats.length === 0 ? null : (
        <DataTable
          caption="Hot seat submissions"
          rows={hotSeats}
          columns={columns}
          getRowId={(row) => row.id}
          searchText={searchText}
          searchPlaceholder="Search submissions…"
          searchLabel="Search hot seat submissions by name, email, or text"
          filter={filter}
          pageSize={25}
          emptyMessage="No submissions yet."
          detail={detail}
        />
      )}
    </div>
  )
}
