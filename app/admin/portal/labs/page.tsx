import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Briefcase, Target } from "lucide-react"
import { readData } from "@/lib/data-store"
import { toLabRow, type LabRow } from "@/lib/lab-audits"
import { LabSubmissionsTable } from "@/components/admin/lab-submissions-table"

export default async function AdminLabsPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const audits = await readData("audits")
  const rows: LabRow[] = audits.flatMap((audit, index) => toLabRow(audit, index) ?? [])
  const count = (kind: LabRow["kind"]) => rows.filter((row) => row.kind === kind).length

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Lab Submissions</h1>
        <p className="text-gray-400">
          Select a health, brand, or offer submission to read the full responses
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Health Assessments</p>
                <p className="text-3xl font-bold text-green-500">{count("health")}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Brand Audits</p>
                <p className="text-3xl font-bold text-blue-500">{count("brand")}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Offer Definitions</p>
                <p className="text-3xl font-bold text-purple-500">{count("offer")}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <LabSubmissionsTable rows={rows} />
    </div>
  )
}
