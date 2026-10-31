import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readData } from "@/lib/data-store"

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hotSeats = await readData("hot-seats")

    // Convert to CSV
    const headers = ["ID", "User Name", "Email", "Challenge", "Context", "Help Wanted", "Selected", "Timestamp"]
    const rows = hotSeats.map((hs: any) => [
      hs.id,
      hs.userName,
      hs.email,
      `"${hs.challenge.replace(/"/g, '""')}"`,
      `"${hs.context.replace(/"/g, '""')}"`,
      `"${hs.helpWanted.replace(/"/g, '""')}"`,
      hs.selected ? "Yes" : "No",
      hs.timestamp,
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row: any[]) => row.join(",")),
    ].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="hot_seats_${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
