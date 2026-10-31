import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { readData } from "@/lib/data-store"

export default async function AdminAttendancePage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const attendance = await readData("attendance")

  const day1CheckIns = attendance.filter((a: any) => a.day === 1)
  const day2CheckIns = attendance.filter((a: any) => a.day === 2)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Attendance Records</h1>
        <p className="text-gray-400">
          View all participant check-ins for both days
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Day 1 Check-Ins</p>
              <p className="text-5xl font-bold text-green-500">{day1CheckIns.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Day 2 Check-Ins</p>
              <p className="text-5xl font-bold text-blue-500">{day2CheckIns.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day 1 */}
      {day1CheckIns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Day 1 - January 3, 2026</h2>
          <div className="space-y-3">
            {day1CheckIns.map((record) => (
              <Card key={record.id} className="bg-[var(--card)] border-[var(--border)]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{record.name}</CardTitle>
                      <CardDescription className="text-gray-400">{record.email}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                </CardHeader>
                {record.reflection && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-400 mb-1">Reflection:</p>
                    <p className="text-white text-sm">{record.reflection}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Day 2 */}
      {day2CheckIns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Day 2 - January 4, 2026</h2>
          <div className="space-y-3">
            {day2CheckIns.map((record) => (
              <Card key={record.id} className="bg-[var(--card)] border-[var(--border)]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{record.name}</CardTitle>
                      <CardDescription className="text-gray-400">{record.email}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-blue-500 border-blue-500">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                </CardHeader>
                {record.reflection && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-400 mb-1">Reflection:</p>
                    <p className="text-white text-sm">{record.reflection}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {attendance.length === 0 && (
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="py-12 text-center text-gray-400">
            No check-ins recorded yet
          </CardContent>
        </Card>
      )}
    </div>
  )
}
