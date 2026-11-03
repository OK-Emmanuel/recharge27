import { NextResponse } from "next/server"
import { saveCourtier } from "@/lib/courtier-db"
import { validateCourtier } from "@/lib/courtiers"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const raw = await request.text()
  if (new TextEncoder().encode(raw).length > 100_000) {
    return NextResponse.json({ ok: false, error: "Application too large." }, { status: 413 })
  }
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid application." }, { status: 400 })
  }
  const result = validateCourtier(body)
  if (!result.application) return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
  try {
    if (!await saveCourtier(result.application)) {
      return NextResponse.json({ ok: false, error: "This application was already sent with different answers. Refresh before applying again." }, { status: 409 })
    }
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Failed to save Courtier application:", error)
    return NextResponse.json({ ok: false, error: "We couldn't save your application. Please try again." }, { status: 500 })
  }
}
