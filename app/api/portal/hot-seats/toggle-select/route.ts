import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readData, writeData } from "@/lib/data-store"

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { hotSeatId } = await request.json()

    const hotSeats = await readData("hot-seats")
    const hsIndex = hotSeats.findIndex((hs: any) => hs.id === hotSeatId)

    if (hsIndex === -1) {
      return NextResponse.json({ error: "Hot seat not found" }, { status: 404 })
    }

    hotSeats[hsIndex].selected = !hotSeats[hsIndex].selected

    await writeData("hot-seats", hotSeats)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to toggle selection:", error)
    return NextResponse.json({ error: "Failed to update hot seat" }, { status: 500 })
  }
}
