import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readData, writeData } from "@/lib/data-store"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, priority } = body

    let announcements: any[] = []

    try {
      announcements = await readData("announcements")
    } catch (error) {
      // No announcements yet
    }

    const newAnnouncement = {
      id: `ann_${Date.now()}`,
      title,
      message,
      priority,
      timestamp: new Date().toISOString(),
      postedBy: session.user.email,
    }

    announcements.unshift(newAnnouncement) // Add to beginning
    await writeData("announcements", announcements)

    return NextResponse.json(newAnnouncement)
  } catch (error) {
    console.error("Failed to post announcement:", error)
    return NextResponse.json({ error: "Failed to post announcement" }, { status: 500 })
  }
}
