import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readData } from "@/lib/data-store"

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const questionsFile = join(process.cwd(), "data", "questions.json")
    const questions = await readData("commitments")

    // Convert to CSV
    const headers = ["ID", "User Name", "Email", "Question", "Category", "Anonymous", "Answered", "Timestamp"]
    const rows = questions.map((q: any) => [
      q.id,
      q.isAnonymous ? "Anonymous" : q.userName,
      q.isAnonymous ? "Hidden" : q.email,
      `"${q.question.replace(/"/g, '""')}"`,
      q.category,
      q.isAnonymous ? "Yes" : "No",
      q.answered ? "Yes" : "No",
      q.timestamp,
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row: any[]) => row.join(",")),
    ].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="questions_${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
