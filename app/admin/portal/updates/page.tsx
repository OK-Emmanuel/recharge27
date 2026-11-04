import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UpdateForm } from "@/components/portal/update-form"
import { UpdatesTable } from "@/components/admin/updates-table"
import { readData } from "@/lib/data-store"
import { sortRows } from "@/lib/admin-table"
import { timestampValue } from "@/lib/format"
import { toUpdateRow } from "@/lib/legacy-records"

export default async function AdminUpdatesPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const records = await readData("updates")
  const updates = sortRows(records.map(toUpdateRow), (row) => timestampValue(row.createdAt), "desc")

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Manage Updates</h1>
        <p className="text-gray-400">
          Create and manage public updates shown on the homepage
        </p>
      </div>

      <Card className="bg-[var(--card)] border-[var(--border)] mb-8">
        <CardHeader>
          <CardTitle className="text-white">Create New Update</CardTitle>
          <CardDescription className="text-gray-400">
            Add event details, images, and call-to-action buttons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateForm />
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-4">All Updates</h2>
        <p className="text-sm text-gray-400 mb-4">
          {updates.length} total update{updates.length !== 1 ? "s" : ""}. Select one to see its full description and buttons.
        </p>
      </div>

      <UpdatesTable rows={updates} />
    </div>
  )
}
