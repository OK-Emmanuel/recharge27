import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen, FileText } from "lucide-react"

const resources = [
  {
    id: 1,
    title: "Life Operating System Planner",
    type: "PDF",
    description: "Strategic framework for life and business design",
    category: "Core",
    url: "/resources/life-operating-system.pdf",
  },
  {
    id: 2,
    title: "Q1 Execution Templates",
    type: "PDF",
    description: "90-day planning and accountability frameworks",
    category: "Core",
    url: "/resources/q1-execution-templates.pdf",
  },
  {
    id: 3,
    title: "AI Monetization Playbook",
    type: "PDF",
    description: "Practical strategies for leveraging AI in your business",
    category: "Reference",
    url: "/resources/ai-monetization.pdf",
  },
  {
    id: 4,
    title: "Founder OS Framework",
    type: "Link",
    description: "External resource for operational systems",
    category: "Optional",
    url: "https://example.com/founder-os",
  },
  {
    id: 5,
    title: "Premium Workbook (Digital)",
    type: "PDF",
    description: "Your bootcamp workbook in digital format",
    category: "Core",
    url: "/resources/premium-workbook.pdf",
  },
]

export default async function ResourcesPage() {

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <FolderOpen className="mr-3 h-8 w-8 text-[var(--accent)]" />
          2026 Resources Vault
        </h1>
        <p className="text-gray-400">
          The original resource catalogue. Download files have not been supplied for this app.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.id} className="bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)] transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <FileText className="h-5 w-5 text-[var(--accent)]" />
                <span className={`text-xs px-2 py-1 rounded ${
                  resource.category === "Core" ? "bg-[var(--primary)]/20 text-[var(--accent)]" :
                  resource.category === "Reference" ? "bg-blue-500/20 text-blue-400" :
                  "bg-gray-500/20 text-gray-400"
                }`}>
                  {resource.category}
                </span>
              </div>
              <CardTitle className="text-white text-base">{resource.title}</CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                {resource.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Unavailable - resource pending upload.</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-[var(--card)] border-[var(--border)]">
        <CardHeader>
          <CardTitle className="text-white text-sm">Resource Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-400 space-y-2">
          <p>• <strong className="text-white">Core</strong> — Essential materials for the bootcamp</p>
          <p>• <strong className="text-white">Reference</strong> — Supporting materials and frameworks</p>
          <p>• <strong className="text-white">Optional</strong> — Additional learning resources</p>
          <p className="mt-4 text-xs">All resources are for personal use only. Please respect intellectual property rights.</p>
        </CardContent>
      </Card>
    </div>
  )
}
