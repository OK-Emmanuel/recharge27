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
    const questions = await readData("questions")
    
    // Map questions and mark which ones belong to current user
    const mappedQuestions = questions.map((q: any) => ({
      ...q,
      isOwn: q.userId === session.user.id,
      // Only show real name if not anonymous OR if user is admin OR if it's their own question
      userName: q.isAnonymous && q.userId !== session.user.id && session.user.role !== "admin" 
        ? "Anonymous" 
        : q.userName,
    }))

    return NextResponse.json({ questions: mappedQuestions.reverse() })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const flags = await getFeatureFlags()
  if (!isFeatureEnabledForSession(flags, "questionsEnabled", session)) {
    return NextResponse.json({ error: "Questions module is currently disabled" }, { status: 403 })
  }

  try {
    const { question, category, isAnonymous } = await request.json()

    if (!question || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const questions = await readData("questions")

    questions.push({
      id: `Q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.id,
      userName: session.user.name,
      email: session.user.email,
      question,
      category,
      isAnonymous: isAnonymous || false,
      answered: false,
      timestamp: new Date().toISOString(),
    })

    await writeData("questions", questions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save question:", error)
    return NextResponse.json({ error: "Failed to save question" }, { status: 500 })
  }
}
