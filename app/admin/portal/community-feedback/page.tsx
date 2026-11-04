import Link from "next/link"
import { readFeedback } from "@/lib/db"
import { facilitators, stages } from "@/lib/intelligence"
import { buildFeedbackSections, countEntries } from "@/lib/feedback-view"
import { FeedbackTable, type FeedbackRow } from "@/components/admin/feedback-table"
import { Button } from "@/components/ui/button"

export default async function CommunityFeedbackPage({ searchParams }: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const parsed = Number(params.page ?? 1)
  const page = Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 100_000 ? parsed : 1
  const { responses, total } = await readFeedback(50, (page - 1) * 50)
  const rows: FeedbackRow[] = responses.map((response) => {
    const sections = buildFeedbackSections(response.answers, stages, facilitators)
    const identified = response.anonymity === "identified"
    return {
      id: response.id,
      name: identified ? response.full_name : null,
      email: identified ? response.email : null,
      anonymity: response.anonymity,
      createdAt: response.created_at,
      answerCount: countEntries(sections),
      sections,
    }
  })
  const pageCount = Math.max(1, Math.ceil(total / 50))
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">2027 Community Feedback</h1>
          <p className="text-muted-foreground">Your Voice submissions. {total} responses, stored separately from the 2026 archive.</p>
        </div>
        <Button asChild><a href="/api/admin/export/community-feedback">Export JSON</a></Button>
      </div>
      <FeedbackTable key={page} rows={rows} />
      <nav aria-label="Feedback pages" className="mt-6 flex justify-between items-center gap-4">
        {page > 1
          ? <Button asChild variant="outline" size="sm" className="border-border"><Link href={`?page=${page - 1}`}>Previous</Link></Button>
          : <span />}
        <span className="text-sm text-muted-foreground">Page {page} of {pageCount}</span>
        {page * 50 < total
          ? <Button asChild variant="outline" size="sm" className="border-border"><Link href={`?page=${page + 1}`}>Next</Link></Button>
          : <span />}
      </nav>
    </div>
  )
}
