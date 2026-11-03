import Link from "next/link"
import { readCourtiers } from "@/lib/courtier-db"
import { courtierQuestions, reviewStatuses } from "@/lib/courtiers"
import { CourtierReview } from "@/components/courtier-review"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function WealthCourtiersAdminPage({ searchParams }: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const params = await searchParams
  const status = reviewStatuses.find((item) => item === params.status) ?? null
  const parsed = Number(params.page ?? 1)
  const page = Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 100_000 ? parsed : 1
  const { applications, total } = await readCourtiers(status, 25, (page - 1) * 25)
  const query = status ? `&status=${status}` : ""
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wealth Courtiers</h1>
        <p className="text-muted-foreground">{total} {status ?? ""} applications. Review skills, evidence, grace, agency, and availability before deciding.</p>
        <Link href="/wealth-courtiers" className="inline-block mt-3 text-accent-bright underline">View application page</Link>
      </div>
      <nav aria-label="Filter applications" className="flex flex-wrap gap-3 mb-6">
        {[null, ...reviewStatuses].map((item) => (
          <Link key={item ?? "all"} href={item ? `?status=${item}` : "?"}
            aria-current={status === item ? "page" : undefined}
            className={`px-4 py-2 border rounded capitalize ${status === item ? "border-accent bg-card" : "border-border text-muted-foreground"}`}>
            {item ?? "All"}
          </Link>
        ))}
      </nav>
      <div className="space-y-6">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex flex-wrap justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="break-words">{application.full_name}</CardTitle>
                  <CardDescription className="break-words">
                    <a href={`mailto:${application.email}`} className="underline">{application.email}</a><br />
                    Applied {new Date(application.created_at).toLocaleString("en-GB", { timeZone: "UTC" })} UTC
                  </CardDescription>
                </div>
                <Badge variant="outline" className="capitalize self-start">{application.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="space-y-5">
                <div>
                  <dt className="text-sm text-muted-foreground mb-2">Skills offered</dt>
                  <dd className="flex flex-wrap gap-2">{application.skills.map((skill) => <Badge variant="secondary" key={skill}>{skill}</Badge>)}</dd>
                </div>
                {application.portfolio && <div><dt className="text-sm text-muted-foreground mb-1">Portfolio / work sample</dt>
                  <dd><a href={application.portfolio} target="_blank" rel="noopener noreferrer" className="text-accent-bright underline break-all">{application.portfolio}</a></dd>
                </div>}
                {courtierQuestions.map((question) => (
                  <div key={question.id}><dt className="text-sm text-muted-foreground mb-1">{question.label}</dt>
                    <dd className="whitespace-pre-wrap break-words">{application.answers[question.id]}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-muted-foreground mt-6">Acknowledged unpaid service, self-funded access, and preparation / arrival / departure commitments. This is self-declared, not proof of ticket payment.</p>
              {application.reviewed_at && <p className="text-sm text-muted-foreground mt-3 break-words">
                Last reviewed by {application.reviewed_by} on {new Date(application.reviewed_at).toLocaleString("en-GB", { timeZone: "UTC" })} UTC
              </p>}
              <CourtierReview key={`${application.id}-${application.version}`} id={application.id} status={application.status}
                notes={application.review_notes} version={application.version} />
            </CardContent>
          </Card>
        ))}
        {applications.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No applications on this page.</CardContent></Card>}
      </div>
      <nav aria-label="Application pages" className="mt-8 flex justify-between items-center gap-4">
        {page > 1 ? <Link href={`?page=${page - 1}${query}`} className="text-accent-bright">Previous</Link> : <span />}
        <span className="text-sm text-muted-foreground">Page {page}</span>
        {page * 25 < total ? <Link href={`?page=${page + 1}${query}`} className="text-accent-bright">Next</Link> : <span />}
      </nav>
    </div>
  )
}
