import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readData, writeData } from "@/lib/data-store"
import { getFeatureFlags, isFeatureEnabledForSession } from "@/lib/feature-flags"

export async function GET() {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const hotSeats = await readData("hot-seats")
    return NextResponse.json({ hotSeats: hotSeats.reverse() })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load hot seats" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const flags = await getFeatureFlags()
  if (!isFeatureEnabledForSession(flags, "hotSeatsEnabled", session)) {
    return NextResponse.json({ error: "Hot seats are currently disabled" }, { status: 403 })
  }

  try {
    const { challenge, context, helpWanted } = await request.json()

    if (!challenge || !context || !helpWanted) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const hotSeats = await readData("hot-seats")
    const existingIndex = hotSeats.findIndex((hs: any) => hs.userId === session.user.id)

    const submission = {
      id: existingIndex >= 0 ? hotSeats[existingIndex].id : `HS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.id,
      userName: session.user.name,
      email: session.user.email,
      challenge,
      context,
      helpWanted,
      selected: existingIndex >= 0 ? hotSeats[existingIndex].selected : false,
      timestamp: existingIndex >= 0 ? hotSeats[existingIndex].timestamp : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      hotSeats[existingIndex] = submission
    } else {
      hotSeats.push(submission)
    }

    await writeData("hot-seats", hotSeats)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save hot seat:", error)
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 })
  }
}
