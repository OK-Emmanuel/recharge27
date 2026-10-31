import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readData, writeData } from "@/lib/data-store"

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { questionId } = await request.json()

    const questions = await readData("questions")
    const questionIndex = questions.findIndex((q: any) => q.id === questionId)

    if (questionIndex === -1) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    questions[questionIndex].answered = true
    questions[questionIndex].answeredAt = new Date().toISOString()
    questions[questionIndex].answeredBy = session.user.email

    await writeData("questions", questions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to mark question as answered:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}
