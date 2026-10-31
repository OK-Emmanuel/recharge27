import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnnouncementForm } from "@/components/portal/announcement-form"
import { Bell } from "lucide-react"
import { readData } from "@/lib/data-store"

export default async function AdminAnnouncementsPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const announcements = (await readData("announcements")).sort(
    (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          {announcements.length} total announcements
        </p>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => {
          const priorityColors = {
            high: "border-red-500 bg-red-500/5",
            medium: "border-[var(--accent)] bg-[var(--primary)]/5",
            low: "border-blue-400 bg-blue-400/5",
          }

          const priorityBadgeColors = {
            high: "bg-red-500/20 text-red-300",
            medium: "bg-[var(--primary)]/20 text-[var(--accent)]",
            low: "bg-blue-400/20 text-blue-300",
          }

          return (
            <Card
              key={announcement.id}
              className={`${priorityColors[announcement.priority as keyof typeof priorityColors]} border-l-4`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[var(--accent)]" />
                    <CardTitle className="text-white">{announcement.title}</CardTitle>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      priorityBadgeColors[announcement.priority as keyof typeof priorityBadgeColors]
                    }`}
                  >
                    {announcement.priority.toUpperCase()}
                  </span>
                </div>
                <CardDescription className="text-gray-400 text-xs">
                  {new Date(announcement.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-wrap">{announcement.message}</p>
              </CardContent>
            </Card>
          )
        })}

        {announcements.length === 0 && (
          <Card className="bg-[var(--card)] border-[var(--border)]">
            <CardContent className="py-8 text-center text-gray-400">
              No announcements yet. Post your first announcement above.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
