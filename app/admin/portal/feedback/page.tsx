import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { readData } from "@/lib/data-store"
import { sortRows } from "@/lib/admin-table"
import { timestampValue } from "@/lib/format"
import { toFeedbackRow } from "@/lib/legacy-records"
import { LegacyFeedbackTable } from "@/components/admin/legacy-feedback-table"

export default async function AdminFeedbackPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const records = await readData("feedback")
  const rows = sortRows(records.flatMap((record, index) => toFeedbackRow(record, index) ?? []), (row) => timestampValue(row.submittedAt), "desc")
  const day1Count = rows.filter((row) => row.kind === "day1").length
  const finalCount = rows.filter((row) => row.kind === "final").length

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Feedback & Insights</h1>
        <p className="text-gray-400">
          Select a response to read the full feedback and any testimonial
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Day 1 Reflections</p>
              <p className="text-5xl font-bold text-yellow-500">{day1Count}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Final Feedback</p>
              <p className="text-5xl font-bold text-[var(--accent)]">{finalCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <LegacyFeedbackTable rows={rows} />
    </div>
  )
}
