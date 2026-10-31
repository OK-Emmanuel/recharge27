import { auth } from "@/lib/auth"
import QuestionsList from "@/components/portal/questions-list"

export default async function QuestionsPage() {
  const session = await auth()
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">2026 Questions Desk</h1>
      <p className="text-muted-foreground mb-8">Review the previous edition's questions and mark them as answered.</p>
      <QuestionsList userId={session?.user.id ?? ""} isAdmin />
    </div>
  )
}
