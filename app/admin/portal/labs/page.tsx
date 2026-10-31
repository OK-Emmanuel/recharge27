import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Briefcase, Target } from "lucide-react"
import { readData } from "@/lib/data-store"

export default async function AdminLabsPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const audits = await readData("audits")

  const healthAudits = audits.filter((a: any) => a.type === "health")
  const brandAudits = audits.filter((a: any) => a.type === "brand")
  const offerAudits = audits.filter((a: any) => a.type === "offer")

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Lab Submissions</h1>
        <p className="text-gray-400">
          Review all health, brand, and offer audit submissions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Health Assessments</p>
                <p className="text-3xl font-bold text-green-500">{healthAudits.length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Brand Audits</p>
                <p className="text-3xl font-bold text-blue-500">{brandAudits.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Offer Definitions</p>
                <p className="text-3xl font-bold text-purple-500">{offerAudits.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Assessments */}
      {healthAudits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 text-green-500 mr-2" />
            Health Assessments
          </h2>
          <div className="space-y-4">
            {healthAudits.map((audit) => (
              <Card key={audit.id} className="bg-[var(--card)] border-[var(--border)]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white">{audit.name}</CardTitle>
                      <CardDescription className="text-gray-400">{audit.email}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      {audit.timestamp ? new Date(audit.timestamp).toLocaleDateString() : "N/A"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-gray-400">Sleep</p>
                      <p className="text-white">{audit.answers?.sleep}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Energy</p>
                      <p className="text-white">{audit.answers?.energy}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Stress</p>
                      <p className="text-white">{audit.answers?.stress}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Focus</p>
                      <p className="text-white">{audit.answers?.focus}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Exercise</p>
                      <p className="text-white">{audit.answers?.exercise}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Nutrition</p>
                      <p className="text-white">{audit.answers?.nutrition}</p>
                    </div>
                  </div>
                  {audit.answers?.redFlags && (
                    <div>
                      <p className="text-gray-400 font-medium">Red Flags:</p>
                      <p className="text-white">{audit.answers.redFlags}</p>
                    </div>
                  )}
                  {audit.answers?.intentions && (
                    <div>
                      <p className="text-gray-400 font-medium">90-Day Intentions:</p>
                      <p className="text-white">{audit.answers.intentions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Brand Audits */}
      {brandAudits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
            Brand Audits
          </h2>
          <div className="space-y-4">
            {brandAudits.map((audit) => {
              const sections = [
                { title: "Clarity & Positioning", keys: ["clarity_q1", "clarity_q2", "clarity_q3"] },
                { title: "Brand Signal", keys: ["brand_q1", "brand_q2", "brand_q3"] },
                { title: "Offer & Value", keys: ["offer_q1", "offer_q2", "offer_q3"] },
                { title: "Systems & Scale", keys: ["systems_q1", "systems_q2", "systems_q3"] },
                { title: "AI & Leverage", keys: ["ai_q1", "ai_q2", "ai_q3"] },
              ]
              const questions = [
                ["What do you do? Can you explain it in one sentence?", "Who specifically is your ideal client/customer?", "What makes your approach different or unique?"],
                ["How do you currently show up online? (Social, website, etc.)", "Does your brand look premium or commodity?", "What perception do you want people to have of you/your business?"],
                ["What are you currently selling? (Products/Services)", "How do you price your offer?", "What specific problem does your offer solve?"],
                ["How do leads currently find you?", "What's your sales/conversion process?", "What are your biggest bottlenecks to scaling?"],
                ["Are you using AI in your business? If yes, how?", "What repetitive tasks take up most of your time?", "Where do you see AI helping you most?"],
              ]
              return (
                <Card key={audit.id} className="bg-[var(--card)] border-[var(--border)]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white">{audit.name}</CardTitle>
                        <CardDescription className="text-gray-400">{audit.email}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-blue-500 border-blue-500">
                        {audit.timestamp ? new Date(audit.timestamp).toLocaleDateString() : "N/A"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {audit.decisionLock && (
                      <div className="pb-3 border-b border-[var(--border)]">
                        <p className="text-[var(--accent)] font-medium mb-1">Decision Lock:</p>
                        <p className="text-white">{audit.decisionLock}</p>
                      </div>
                    )}
                    <details className="text-gray-400">
                      <summary className="cursor-pointer hover:text-white font-medium">View Detailed Responses</summary>
                      <div className="mt-4 space-y-6">
                        {sections.map((section, sIdx) => (
                          <div key={section.title} className="space-y-3">
                            <h4 className="text-blue-400 font-medium">{section.title}</h4>
                            {section.keys.map((key, qIdx) => {
                              const answer = audit.responses?.[key]
                              if (!answer) return null
                              return (
                                <div key={key} className="pl-3 border-l-2 border-blue-500/30">
                                  <p className="text-gray-400 text-xs mb-1">{questions[sIdx][qIdx]}</p>
                                  <p className="text-white">{answer}</p>
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </details>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Offer Definitions */}
      {offerAudits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Target className="h-5 w-5 text-purple-500 mr-2" />
            Offer Definitions
          </h2>
          <div className="space-y-4">
            {offerAudits.map((audit) => (
              <Card key={audit.id} className="bg-[var(--card)] border-[var(--border)]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white">{audit.name}</CardTitle>
                      <CardDescription className="text-gray-400">{audit.email}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-purple-500 border-purple-500">
                      {audit.timestamp ? new Date(audit.timestamp).toLocaleDateString() : "N/A"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {audit.offerStatement && (
                    <div>
                      <p className="text-[var(--accent)] font-medium">Offer Statement:</p>
                      <p className="text-white">{audit.offerStatement}</p>
                    </div>
                  )}
                  {audit.decision && (
                    <div>
                      <p className="text-green-400 font-medium">Execution Decision:</p>
                      <p className="text-white">{audit.decision}</p>
                    </div>
                  )}
                  {audit.executionPlan && (
                    <div>
                      <p className="text-blue-400 font-medium">Execution Roadmap:</p>
                      <p className="text-white">{audit.executionPlan}</p>
                    </div>
                  )}
                  {audit.measurementPlan && (
                    <div>
                      <p className="text-purple-300 font-medium">Measurement & KPIs:</p>
                      <p className="text-white">{audit.measurementPlan}</p>
                    </div>
                  )}
                  <details className="text-gray-400">
                    <summary className="cursor-pointer hover:text-white">View Full Responses</summary>
                    <pre className="mt-2 text-xs bg-[var(--background)] p-3 rounded overflow-x-auto">
                      {JSON.stringify(audit.responses, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {audits.length === 0 && (
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardContent className="py-12 text-center text-gray-400">
            No lab submissions yet
          </CardContent>
        </Card>
      )}
    </div>
  )
}
