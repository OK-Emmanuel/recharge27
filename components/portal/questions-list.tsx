"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, User, UserX } from "lucide-react"
import { DataTable, type DataTableColumn, type DataTableDetail, type DataTableFilter } from "@/components/admin/data-table"
import { DetailFact, DetailFacts, DetailSection } from "@/components/admin/detail-parts"
import { StatusBadge } from "@/components/admin/status-badge"
import { TextCell } from "@/components/admin/text-cell"
import { formatDate, formatDateTime, timestampValue } from "@/lib/format"
import { toQuestionRow, type QuestionRow } from "@/lib/legacy-records"

interface QuestionsListProps {
  userId: string
  isAdmin: boolean
}

const askedBy = (row: QuestionRow) => row.anonymous ? "Anonymous" : row.name ?? "Unknown participant"

function AnsweredBadge() {
  return <StatusBadge tone="success"><Check />Answered</StatusBadge>
}

function StatusPill({ row }: { row: QuestionRow }) {
  return row.answered ? <AnsweredBadge /> : <StatusBadge tone="warning" dot>Open</StatusBadge>
}

function AskedBy({ row }: { row: QuestionRow }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      {row.anonymous ? <UserX aria-hidden className="size-4" /> : <User aria-hidden className="size-4" />}
      {askedBy(row)}
    </span>
  )
}

const columns: DataTableColumn<QuestionRow>[] = [
  { id: "question", header: "Question", sortValue: (row) => row.question, cell: (row) => <TextCell title={row.question || "No question text"} lines={2} /> },
  { id: "category", header: "Category", className: "hidden md:table-cell", sortValue: (row) => row.category, cell: (row) => <StatusBadge>{row.category}</StatusBadge> },
  { id: "from", header: "From", className: "hidden lg:table-cell", sortValue: askedBy, cell: (row) => <AskedBy row={row} /> },
  { id: "status", header: "Status", sortValue: (row) => row.answered ? 1 : 0, cell: (row) => <StatusPill row={row} /> },
  { id: "asked", header: "Asked", className: "hidden whitespace-nowrap sm:table-cell", sortValue: (row) => timestampValue(row.askedAt),
    cell: (row) => <span className="text-muted-foreground">{formatDate(row.askedAt)}</span> },
]

const filter: DataTableFilter<QuestionRow> = {
  label: "Filter by status",
  options: [{ value: "open", label: "Open" }, { value: "answered", label: "Answered" }],
  getValue: (row) => row.answered ? "answered" : "open",
}

const searchText = (row: QuestionRow) => [row.question, row.category, askedBy(row), row.answered ? "answered" : "open"].join(" ")

export default function QuestionsList({ isAdmin }: QuestionsListProps) {
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions()
    
    const handleUpdate = () => fetchQuestions()
    window.addEventListener("questionsUpdated", handleUpdate)
    
    return () => window.removeEventListener("questionsUpdated", handleUpdate)
  }, [])

  const fetchQuestions = async () => {
    setError(null)
    try {
      const res = await fetch("/api/portal/questions")
      if (res.ok) {
        const data = await res.json()
        setQuestions(Array.isArray(data.questions) ? data.questions.map(toQuestionRow) : [])
      } else throw new Error(`Failed to load questions (${res.status})`)
    } catch (error) {
      console.error("Failed to fetch questions:", error)
      setError("Unable to load questions. Please retry.")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAnswered = async (questionId: string) => {
    if (pendingId) return
    setPendingId(questionId)
    try {
      const res = await fetch("/api/portal/questions/mark-answered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      })

      if (res.ok) {
        await fetchQuestions()
      } else throw new Error(`Failed to update question (${res.status})`)
    } catch (error) {
      console.error("Failed to mark as answered:", error)
      setError("Unable to mark this question as answered. Please retry.")
    } finally {
      setPendingId(null)
    }
  }

  if (loading) {
    return (
      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardContent className="py-8 text-center text-gray-400">
          Loading questions...
        </CardContent>
      </Card>
    )
  }

  const detail: DataTableDetail<QuestionRow> = {
    title: (row) => `Question from ${askedBy(row)}`,
    description: (row) => <>Asked {formatDateTime(row.askedAt)}</>,
    badge: (row) => <StatusPill row={row} />,
    content: (row) => (
      <>
        <DetailSection title="Question">
          <p className="rounded-lg border border-accent/40 bg-accent/5 px-4 py-3.5 text-base leading-relaxed break-words whitespace-pre-wrap text-foreground">
            {row.question || "No question text."}
          </p>
        </DetailSection>
        <DetailSection title="Details">
          <DetailFacts>
            <DetailFact label="Category">{row.category}</DetailFact>
            <DetailFact label="Asked by"><AskedBy row={row} /></DetailFact>
            <DetailFact label="Asked">{formatDateTime(row.askedAt)}</DetailFact>
            <DetailFact label="Status">{row.answered ? "Answered" : "Open"}</DetailFact>
            {row.answered && <DetailFact label="Answered">{formatDateTime(row.answeredAt)}</DetailFact>}
            {row.answered && row.answeredBy && <DetailFact label="Answered by">{row.answeredBy}</DetailFact>}
          </DetailFacts>
        </DetailSection>
      </>
    ),
    footer: isAdmin
      ? (row) => row.answered ? undefined : (
        <Button type="button" disabled={pendingId !== null} onClick={() => handleMarkAnswered(row.id)}>
          {pendingId === row.id ? "Saving..." : "Mark as Answered"}
        </Button>
      )
      : undefined,
  }

  return (
    <div className="space-y-4">
      {error && <div role="alert" className="text-danger">{error} <Button variant="outline" onClick={fetchQuestions}>Retry</Button></div>}

      {error && questions.length === 0 ? null : (
        <DataTable
          caption="Questions"
          rows={questions}
          columns={columns}
          getRowId={(row) => row.id}
          searchText={searchText}
          searchPlaceholder="Search questions…"
          filter={filter}
          pageSize={25}
          emptyMessage="No questions yet."
          detail={detail}
        />
      )}
    </div>
  )
}
