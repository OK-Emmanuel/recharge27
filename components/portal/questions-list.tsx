"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, UserX, Check } from "lucide-react"

interface QuestionsListProps {
  userId: string
  isAdmin: boolean
}

interface Question {
  id: string
  question: string
  category: string
  isAnonymous: boolean
  userName: string
  answered: boolean
  timestamp: string
  isOwn?: boolean
}

export default function QuestionsList({ userId, isAdmin }: QuestionsListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions()
    
    const handleUpdate = () => fetchQuestions()
    window.addEventListener("questionsUpdated", handleUpdate)
    
    return () => window.removeEventListener("questionsUpdated", handleUpdate)
  }, [])

  const fetchQuestions = async () => {
    setError(null)
    try {
      const res = await fetch("/api/portal/questions")
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.questions)
      } else throw new Error(`Failed to load questions (${res.status})`)
    } catch (error) {
      console.error("Failed to fetch questions:", error)
      setError("Unable to load questions. Please retry.")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAnswered = async (questionId: string) => {
    try {
      const res = await fetch("/api/portal/questions/mark-answered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      })

      if (res.ok) {
        fetchQuestions()
      } else throw new Error(`Failed to update question (${res.status})`)
    } catch (error) {
      console.error("Failed to mark as answered:", error)
      setError("Unable to mark this question as answered. Please retry.")
    }
  }

  if (loading) {
    return (
      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardContent className="py-8 text-center text-gray-400">
          Loading questions...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && <div role="alert" className="text-danger">{error} <Button variant="outline" onClick={fetchQuestions}>Retry</Button></div>}
      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardHeader>
          <CardTitle className="text-white">All Questions</CardTitle>
        </CardHeader>
      </Card>

      {error && questions.length === 0 ? null : questions.length === 0 ? (
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="py-8 text-center text-gray-400">
            No questions yet. Be the first to ask!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Card 
              key={q.id} 
              className={`bg-[var(--card)] ${q.answered ? 'border-green-500/30' : 'border-[var(--border)]'} ${q.isOwn ? 'border-l-4 border-l-[var(--accent)]' : ''}`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {q.isAnonymous ? (
                      <UserX className="h-4 w-4 text-gray-500" />
                    ) : (
                      <User className="h-4 w-4 text-[var(--accent)]" />
                    )}
                    <span className="text-sm text-gray-400">
                      {q.isAnonymous ? "Anonymous" : q.userName}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {q.category}
                    </Badge>
                  </div>
                  {q.answered && (
                    <Badge className="bg-green-500/20 text-green-400">
                      <Check className="h-3 w-3 mr-1" />
                      Answered
                    </Badge>
                  )}
                </div>
                
                <p className="text-white mb-3">{q.question}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(q.timestamp).toLocaleString()}</span>
                  {isAdmin && !q.answered && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAnswered(q.id)}
                      className="text-xs"
                    >
                      Mark as Answered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
