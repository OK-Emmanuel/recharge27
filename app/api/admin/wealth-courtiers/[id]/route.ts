import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { reviewCourtier } from "@/lib/courtier-db"
import { validSubmissionId, validateCourtierReview } from "@/lib/courtiers"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin" || !session.user.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ ok: false, error: "Invalid request origin" }, { status: 403 })
  }
  const { id } = await params
  if (!validSubmissionId(id)) return NextResponse.json({ ok: false, error: "Invalid application ID" }, { status: 400 })
  const raw = await request.text()
  if (new TextEncoder().encode(raw).length > 40_000) return NextResponse.json({ ok: false, error: "Review too large" }, { status: 413 })
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid review" }, { status: 400 })
  }
  const result = validateCourtierReview(body)
  if (!result.review) return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
  try {
    const { status, notes, version } = result.review
    if (!await reviewCourtier(id, status, notes, version, session.user.email)) {
      return NextResponse.json({ ok: false, error: "This application changed or no longer exists. Refresh before reviewing it." }, { status: 409 })
    }
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Failed to review Courtier application:", error)
    return NextResponse.json({ ok: false, error: "Could not save review. Please try again." }, { status: 500 })
  }
}
