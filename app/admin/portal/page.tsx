import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, FlaskConical, Star, Bell, MessageCircle, CheckCircle, Download, SlidersHorizontal } from "lucide-react"

export default async function AdminPortalPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const adminSections = [
    {
      title: "Wealth Courtiers",
      description: "Manually review volunteer applications, record decisions, and keep internal notes",
      href: "/admin/portal/wealth-courtiers",
      icon: Users,
      color: "text-[var(--accent)]",
    },
    {
      title: "2027 Community Feedback",
      description: "Your Voice responses, interests, and suggestions for the next edition",
      href: "/admin/portal/community-feedback",
      icon: MessageCircle,
      color: "text-[var(--accent)]",
    },
    {
      title: "Participants Management",
      description: "View and manage bootcamp participants",
      href: "/admin/portal/participants",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Attendance Records",
      description: "View check-in records and export data",
      href: "/admin/portal/attendance",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Lab Submissions",
      description: "Review all health, brand, and offer audits",
      href: "/admin/portal/labs",
      icon: FlaskConical,
      color: "text-purple-500",
    },
    {
      title: "Questions Desk",
      description: "Manage questions and mark as answered",
      href: "/admin/portal/questions",
      icon: MessageSquare,
      color: "text-yellow-500",
    },
    {
      title: "Hot Seats",
      description: "Select participants for hot seat discussions",
      href: "/admin/portal/hot-seats",
      icon: Star,
      color: "text-orange-500",
    },
    {
      title: "Announcements",
      description: "Post updates and manage announcements",
      href: "/admin/portal/announcements",
      icon: Bell,
      color: "text-red-500",
    },
    {
      title: "2026 Feedback & Insights",
      description: "View the previous edition's participant feedback",
      href: "/admin/portal/feedback",
      icon: MessageCircle,
      color: "text-pink-500",
    },
    {
      title: "Export All Data",
      description: "Download comprehensive data exports",
      href: "/admin/portal/export",
      icon: Download,
      color: "text-teal-500",
    },
    {
      title: "Feature Flags",
      description: "Enable or disable portal modules without code changes",
      href: "/admin/portal/features",
      icon: SlidersHorizontal,
      color: "text-indigo-500",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
        <p className="text-gray-400">
          Review community feedback and Courtier applications, and manage the 2026 archive
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon
          
          return (
            <Link key={section.href} href={section.href}>
              <Card className="bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)] transition-all h-full cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`h-6 w-6 ${section.color}`} />
                    <CardTitle className="text-white">{section.title}</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">
                    {section.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
