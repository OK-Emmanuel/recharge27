import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { readData } from "@/lib/data-store"
import { Badge } from "@/components/ui/badge"

export default async function AdminParticipantsPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const participants = await readData<{
    id: string; firstName: string; lastName: string; email: string; status: string; role?: string
  }>("participants")

  const confirmedCount = participants.filter((p) => p.status === "confirmed").length

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Participants Management</h1>
        <p className="text-gray-400">
          View and manage all bootcamp participants
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
              <p className="text-4xl font-bold text-blue-500">
                {participants.filter((p) => p.role === "admin").length}
              </p>
              <p className="text-sm text-gray-400 mt-1">Admins</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {participants.map((participant) => (
          <Card key={participant.id} className="bg-[var(--card)] border-[var(--border)]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white">
                    {participant.firstName} {participant.lastName}
                  </CardTitle>
                  <CardDescription className="text-gray-400">{participant.email}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className={
                      participant.status === "confirmed"
                        ? "text-green-500 border-green-500"
                        : "text-yellow-500 border-yellow-500"
                    }
                  >
                    {participant.status}
                  </Badge>
                  {participant.role === "admin" && (
                    <Badge variant="outline" className="text-purple-500 border-purple-500">
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {participants.length === 0 && (
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="py-12 text-center text-gray-400">
            No participants found
          </CardContent>
        </Card>
      )}

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
