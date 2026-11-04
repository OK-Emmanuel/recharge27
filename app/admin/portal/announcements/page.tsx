import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnnouncementForm } from "@/components/portal/announcement-form"
import { AnnouncementsTable } from "@/components/admin/announcements-table"
import { readData } from "@/lib/data-store"
import { sortRows } from "@/lib/admin-table"
import { timestampValue } from "@/lib/format"
import { toAnnouncementRow } from "@/lib/legacy-records"

export default async function AdminAnnouncementsPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const records = await readData("announcements")
  const announcements = sortRows(records.map(toAnnouncementRow), (row) => timestampValue(row.postedAt), "desc")

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Manage Announcements</h1>
        <p className="text-gray-400">
          Post updates and communicate with all participants
        </p>
      </div>

      <Card className="bg-[var(--card)] border-[var(--border)] mb-8">
        <CardHeader>
          <CardTitle className="text-white">Post New Announcement</CardTitle>
          <CardDescription className="text-gray-400">
            Choose priority level to determine urgency and color coding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnnouncementForm />
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Announcements</h2>
        <p className="text-sm text-gray-400 mb-4">
          {announcements.length} total announcements. Select one to read the full message.
        </p>
      </div>

      <AnnouncementsTable rows={announcements} />
    </div>
  )
}
