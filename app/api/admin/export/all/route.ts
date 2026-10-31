import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readData } from "@/lib/data-store"
import { exportFeedback } from "@/lib/db"

export async function GET() {
  if ((await auth())?.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const keys = ["participants", "attendance", "audits", "questions", "hot-seats", "feedback", "announcements", "updates", "feature-flags"]
    const [legacy, community] = await Promise.all([
      Promise.all(keys.map(async (key) => {
        const records = await readData<Record<string, unknown>>(key)
        return [key, records.map(({ password, passwordHash, ...record }) => record)] as const
      })),
      exportFeedback(),
    ])
    return new NextResponse(JSON.stringify({
      exported_at: new Date().toISOString(),
      editions: { "2026": Object.fromEntries(legacy), "2027": { feedback: community } },
    }, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="wealthlab-all-data.json"',
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Failed to export dashboard data:", error)
    return NextResponse.json({ error: "Could not export dashboard data" }, { status: 500 })
  }
}
