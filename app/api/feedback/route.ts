import { NextResponse } from "next/server"
import { saveFeedback } from "@/lib/db"
import { sanitizeFeedback } from "@/lib/intelligence"

export const runtime = "nodejs"

const MAX_BODY_BYTES = 100_000

export async function POST(request: Request) {
  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Submission too large" }, { status: 413 })
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid submission" }, { status: 400 })
  }

  const submission = sanitizeFeedback(body)
  if (!submission) {
    return NextResponse.json({ ok: false, error: "Invalid submission" }, { status: 400 })
  }

  try {
    await saveFeedback(submission)
  } catch (error) {
    console.error("Failed to save feedback:", error)
    return NextResponse.json({ ok: false, error: "Could not save feedback" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
