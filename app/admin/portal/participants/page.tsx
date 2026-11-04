import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { readData } from "@/lib/data-store"
import { toParticipantRow } from "@/lib/legacy-records"
import { ParticipantsTable } from "@/components/admin/participants-table"

export default async function AdminParticipantsPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const participants = (await readData("participants")).map(toParticipantRow)
  const confirmedCount = participants.filter((p) => p.status === "confirmed").length
  const adminCount = participants.filter((p) => p.isAdmin).length

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Participants Management</h1>
        <p className="text-gray-400">
          View all bootcamp participants and select one to see their details
        </p>
      </div>

      <Card className="bg-[var(--card)] border-[var(--border)] mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-[var(--accent)]">{participants.length}</p>
              <p className="text-sm text-gray-400 mt-1">Total Participants</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500">{confirmedCount}</p>
              <p className="text-sm text-gray-400 mt-1">Confirmed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500">{adminCount}</p>
              <p className="text-sm text-gray-400 mt-1">Admins</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ParticipantsTable rows={participants} />

      <Card className="mt-8 bg-blue-500/5 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-300 text-sm">Note</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-400">
          These are the original 2026 participants from the shared database. This view does not create new registrations.
        </CardContent>
      </Card>
    </div>
  )
}
