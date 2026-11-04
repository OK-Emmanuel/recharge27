import Link from "next/link"
import { readCourtiers } from "@/lib/courtier-db"
import { reviewStatuses } from "@/lib/courtiers"
import { CourtierTable } from "@/components/admin/courtier-table"
import { pillClass } from "@/components/admin/pill-class"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const pageSize = 25

export default async function WealthCourtiersAdminPage({ searchParams }: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const params = await searchParams
  const status = reviewStatuses.find((item) => item === params.status) ?? null
  const parsed = Number(params.page ?? 1)
  const page = Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 100_000 ? parsed : 1
  const { applications, total } = await readCourtiers(status, pageSize, (page - 1) * pageSize)
  const query = status ? `&status=${status}` : ""
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wealth Courtiers</h1>
        <p className="text-muted-foreground">{total} {status ?? ""} applications. Select an application to review skills, evidence, grace, agency, and availability before deciding.</p>
        <Link href="/wealth-courtiers" className="inline-block mt-3 text-accent-bright underline">View application page</Link>
      </div>
      <nav aria-label="Filter applications" className="flex flex-wrap gap-2 mb-6">
        {[null, ...reviewStatuses].map((item) => (
          <Link key={item ?? "all"} href={item ? `?status=${item}` : "?"}
            aria-current={status === item ? "page" : undefined}
            className={cn(pillClass(status === item), "capitalize")}>
            {item ?? "All"}
          </Link>
        ))}
      </nav>
      <CourtierTable key={`${status ?? "all"}:${page}`} applications={applications} />
      <nav aria-label="Application pages" className="mt-6 flex justify-between items-center gap-4">
        {page > 1
          ? <Button asChild variant="outline" size="sm" className="border-border"><Link href={`?page=${page - 1}${query}`}>Previous</Link></Button>
          : <span />}
        <span className="text-sm text-muted-foreground">Page {page} of {pageCount}</span>
        {page * pageSize < total
          ? <Button asChild variant="outline" size="sm" className="border-border"><Link href={`?page=${page + 1}${query}`}>Next</Link></Button>
          : <span />}
      </nav>
    </div>
  )
}
