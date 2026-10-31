import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readData } from "@/lib/data-store"

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attendanceFile = join(process.cwd(), "data", "attendance.json")
    const attendance = await readData("commitments")

    // Convert to CSV
    const headers = ["ID", "User ID", "Email", "Name", "Day", "Reflection", "Timestamp"]
    const rows = attendance.map((record: any) => [
      record.id,
      record.userId,
      record.email,
      record.name,
      record.day,
      record.reflection ? `"${record.reflection.replace(/"/g, '""')}"` : "",
      record.timestamp,
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row: any[]) => row.join(",")),
    ].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance_${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
