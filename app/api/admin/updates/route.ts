import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readData, writeData } from "@/lib/data-store"

interface Update {
  id: string
  slug: string
  title: string
  excerpt: string
  description: string
  image: string
  eventDate: string
  status: "upcoming" | "ongoing" | "past"
  ctaButtons: Array<{
    label: string
    href: string
    variant: "default" | "outline" | "secondary" | "ghost"
  }>
  timestamp: string
  createdBy: string
}

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await readData<Update>("updates")

    return NextResponse.json(updates)
  } catch (error) {
    console.error("Failed to fetch updates:", error)
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, excerpt, description, image, eventDate, status, ctaButtons } = body

    // Validate required fields
    if (!title || !slug || !excerpt || !description || !image || !eventDate || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updates = await readData<Update>("updates")

    // Check for duplicate slug
    const existingUpdate = updates.find((u) => u.slug === slug)
    if (existingUpdate) {
      return NextResponse.json(
        { error: "An update with this slug already exists" },
        { status: 409 }
      )
    }

    const newUpdate: Update = {
      id: `upd_${Date.now()}`,
      slug,
      title,
      excerpt,
      description,
      image,
      eventDate,
      status,
      ctaButtons: ctaButtons || [],
      timestamp: new Date().toISOString(),
      createdBy: session.user.email || "unknown",
    }

    updates.unshift(newUpdate) // Add to beginning
    await writeData("updates", updates)

    return NextResponse.json(newUpdate)
  } catch (error) {
    console.error("Failed to create update:", error)
    return NextResponse.json({ error: "Failed to create update" }, { status: 500 })
  }
}
