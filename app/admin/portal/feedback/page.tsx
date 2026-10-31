import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { readData } from "@/lib/data-store"

export default async function AdminFeedbackPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const feedback = await readData("feedback")

  const day1Feedback = feedback.filter((f) => f.type === "day1")
  const finalFeedback = feedback.filter((f) => f.type === "final")

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Feedback & Insights</h1>
        <p className="text-gray-400">
          Review participant feedback and testimonials
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Day 1 Reflections</p>
              <p className="text-5xl font-bold text-yellow-500">{day1Feedback.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Final Feedback</p>
              <p className="text-5xl font-bold text-[var(--accent)]">{finalFeedback.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final Feedback */}
      {finalFeedback.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Final Bootcamp Feedback</h2>
          <div className="space-y-4">
            {finalFeedback.map((fb) => (
              <Card key={fb.id} className="bg-[var(--card)] border-[var(--border)]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white">{fb.userName}</CardTitle>
                      <CardDescription className="text-gray-400">{fb.email}</CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[var(--accent)] border-[var(--accent)]">
                        Rating: {fb.rating}/5
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(fb.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400 font-medium">Most Valuable:</p>
                    <p className="text-white">{fb.mostValuable}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">One Big Decision:</p>
                    <p className="text-white">{fb.decision}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">What Was Unclear:</p>
                    <p className="text-white">{fb.unclear}</p>
                  </div>
                  {fb.testimonial && (
                    <div className="pt-3 border-t border-[var(--border)]">
                      <p className="text-green-400 font-medium flex items-center gap-2">
                        Testimonial
                        {fb.canUseTestimonial && (
                          <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                            Can use publicly
                          </Badge>
                        )}
                      </p>
                      <p className="text-white italic">&ldquo;{fb.testimonial}&rdquo;</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Day 1 Feedback */}
      {day1Feedback.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Day 1 Reflections</h2>
          <div className="space-y-4">
            {day1Feedback.map((fb) => (
              <Card key={fb.id} className="bg-[var(--card)] border-[var(--border)]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white">{fb.userName}</CardTitle>
                      <CardDescription className="text-gray-400">{fb.email}</CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                        Rating: {fb.rating}/5
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(fb.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400 font-medium">Most Valuable:</p>
                    <p className="text-white">{fb.mostValuable}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">One Big Decision:</p>
                    <p className="text-white">{fb.decision}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">What Was Unclear:</p>
                    <p className="text-white">{fb.unclear}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {feedback.length === 0 && (
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="py-12 text-center text-gray-400">
            No feedback submitted yet
          </CardContent>
        </Card>
      )}
    </div>
  )
}
