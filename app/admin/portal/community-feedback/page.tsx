import Link from "next/link"
import { readFeedback } from "@/lib/db"
import { facilitators, stages } from "@/lib/intelligence"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const labels = new Map(stages.flatMap((stage) => stage.groups.flat()).flatMap((question) => [
  [question.id, question.label],
  [`${question.id}_other`, `${question.label} - Other`],
] as [string, string][]))
facilitators.forEach((facilitator, index) => {
  labels.set(`facilitator_interest_${index + 1}_${facilitator.name.replaceAll(" ", "_").toLowerCase()}`, `Interest in ${facilitator.name}`)
})

export default async function CommunityFeedbackPage({ searchParams }: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const parsed = Number(params.page ?? 1)
  const page = Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 100_000 ? parsed : 1
  const { responses, total } = await readFeedback(50, (page - 1) * 50)
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">2027 Community Feedback</h1>
          <p className="text-muted-foreground">Your Voice submissions. {total} responses, stored separately from the 2026 archive.</p>
        </div>
        <Button asChild><a href="/api/admin/export/community-feedback">Export JSON</a></Button>
      </div>
      <div className="space-y-5">
        {responses.map((response) => (
          <Card key={response.id}>
            <CardHeader>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <CardTitle>{response.anonymity === "anonymous" ? "Anonymous contribution" : response.full_name}</CardTitle>
                  <CardDescription>
                    {response.anonymity === "identified" && response.email && <span>{response.email} &middot; </span>}
                    {new Date(response.created_at).toLocaleString("en-GB", { timeZone: "UTC" })} UTC
                  </CardDescription>
                </div>
                <Badge variant="outline">{response.anonymity}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="space-y-5">
                {Object.entries(response.answers).map(([key, answer]) => (
                  <div key={key}>
                    <dt className="text-sm text-muted-foreground mb-1">{labels.get(key) ?? key.replaceAll("_", " ")}</dt>
                    <dd className="whitespace-pre-wrap break-words">{Array.isArray(answer) ? answer.join("\n") : answer}</dd>
                  </div>
                ))}
                {Object.keys(response.answers).length === 0 && <p className="text-muted-foreground">No optional questions answered.</p>}
              </dl>
            </CardContent>
          </Card>
        ))}
        {responses.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No feedback on this page.</CardContent></Card>}
      </div>
      <nav aria-label="Feedback pages" className="mt-8 flex justify-between items-center gap-4">
        {page > 1 ? <Link href={`?page=${page - 1}`} className="text-accent-bright">Previous</Link> : <span />}
        <span className="text-sm text-muted-foreground">Page {page}</span>
        {page * 50 < total ? <Link href={`?page=${page + 1}`} className="text-accent-bright">Next</Link> : <span />}
      </nav>
    </div>
  )
}
