import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { readData } from "@/lib/data-store"
import { readFeedback } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default async function AdminExportPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const [participants, attendance, audits, questions, hotSeats, feedback, community] = await Promise.all([
    readData("participants"), readData("attendance"), readData("audits"),
    readData("questions"), readData("hot-seats"), readData("feedback"), readFeedback(1),
  ])
  const stats = {
    participants: participants.length, attendance: attendance.length, audits: audits.length,
    questions: questions.length, hotSeats: hotSeats.length, feedback: feedback.length,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Export Data</h1>
        <p className="text-gray-400">
          Download comprehensive data exports for analysis and follow-up
        </p>
      </div>

      <Card className="bg-[var(--card)] border-[var(--border)] mb-6">
        <CardHeader>
          <CardTitle className="text-white">2026 Data Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-[var(--background)] rounded-lg">
            <div className="text-3xl font-bold text-[var(--accent)]">{stats.participants}</div>
            <div className="text-sm text-gray-400 mt-1">Participants</div>
          </div>
          <div className="text-center p-4 bg-[var(--background)] rounded-lg">
            <div className="text-3xl font-bold text-green-500">{stats.attendance}</div>
            <div className="text-sm text-gray-400 mt-1">Check-ins</div>
          </div>
          <div className="text-center p-4 bg-[var(--background)] rounded-lg">
            <div className="text-3xl font-bold text-purple-500">{stats.audits}</div>
            <div className="text-sm text-gray-400 mt-1">Lab Submissions</div>
          </div>
          <div className="text-center p-4 bg-[var(--background)] rounded-lg">
            <div className="text-3xl font-bold text-yellow-500">{stats.questions}</div>
            <div className="text-sm text-gray-400 mt-1">Questions</div>
          </div>
          <div className="text-center p-4 bg-[var(--background)] rounded-lg">
            <div className="text-3xl font-bold text-orange-500">{stats.hotSeats}</div>
            <div className="text-sm text-gray-400 mt-1">Hot Seats</div>
          </div>
          <div className="text-center p-4 bg-[var(--background)] rounded-lg">
            <div className="text-3xl font-bold text-pink-500">{stats.feedback}</div>
            <div className="text-sm text-gray-400 mt-1">Feedback</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Complete Data Package</CardTitle></CardHeader>
          <CardContent>
            <Button asChild className="w-full"><a href="/api/admin/export/all">Export both editions (JSON)</a></Button>
          </CardContent>
        </Card>
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <a href="/api/admin/export/attendance" download>
              <Button className="w-full bg-[var(--primary)] hover:bg-[color-mix(in srgb,var(--primary) 90%, white 10%)] text-[var(--primary-foreground)]">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-white text-lg">All Lab Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <a href="/api/admin/export/audits" download>
              <Button className="w-full bg-[var(--primary)] hover:bg-[color-mix(in srgb,var(--primary) 90%, white 10%)] text-[var(--primary-foreground)]">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Questions List</CardTitle>
          </CardHeader>
          <CardContent>
            <a href="/api/admin/export/questions" download>
              <Button className="w-full bg-[var(--primary)] hover:bg-[color-mix(in srgb,var(--primary) 90%, white 10%)] text-[var(--primary-foreground)]">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Hot Seat Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <a href="/api/admin/export/hot-seats" download>
              <Button className="w-full bg-[var(--primary)] hover:bg-[color-mix(in srgb,var(--primary) 90%, white 10%)] text-[var(--primary-foreground)]">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Feedback & Reflections</CardTitle>
          </CardHeader>
          <CardContent>
            <a href="/api/admin/export/feedback" download>
              <Button className="w-full bg-[var(--primary)] hover:bg-[color-mix(in srgb,var(--primary) 90%, white 10%)] text-[var(--primary-foreground)]">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-white text-lg">2027 Community Feedback ({community.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <a href="/api/admin/export/community-feedback" download>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export 2027 Feedback (JSON)
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
