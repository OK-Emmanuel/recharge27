import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { readData } from "@/lib/data-store"
import { sortRows } from "@/lib/admin-table"
import { timestampValue } from "@/lib/format"
import { toAttendanceRow } from "@/lib/legacy-records"
import { AttendanceTable } from "@/components/admin/attendance-table"

export default async function AdminAttendancePage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const records = await readData("attendance")
  const rows = sortRows(records.map(toAttendanceRow), (row) => timestampValue(row.checkedInAt), "desc")
  const day1CheckIns = rows.filter((row) => row.day === 1)
  const day2CheckIns = rows.filter((row) => row.day === 2)

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

      <AttendanceTable rows={rows} />
    </div>
  )
}
