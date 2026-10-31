import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { exportFeedback } from "@/lib/db"

export async function GET() {
  if ((await auth())?.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const responses = await exportFeedback()
    return new NextResponse(JSON.stringify({ edition: 2027, responses }, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="wealthlab-2027-feedback.json"',
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Failed to export community feedback:", error)
    return NextResponse.json({ error: "Could not export feedback" }, { status: 500 })
  }
}
