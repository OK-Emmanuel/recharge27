import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UpdateForm } from "@/components/portal/update-form"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Image as ImageIcon } from "lucide-react"
import { readData } from "@/lib/data-store"
import Image from "next/image"

interface Update {
  id: string
  slug: string
  title: string
  excerpt: string
  description: string
  image: string
  eventDate: string
  status: "upcoming" | "ongoing" | "past"
  ctaButtons: Array<{
    label: string
    href: string
    variant: "default" | "outline" | "secondary" | "ghost"
  }>
  timestamp: string
  createdBy: string
}

export default async function AdminUpdatesPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

    const updates = (await readData<Update>("updates")).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  // Status badge styling
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "upcoming":
        return "default"
      case "ongoing":
        return "secondary"
      case "past":
        return "outline"
      default:
        return "outline"
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format time helper
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Manage Updates</h1>
        <p className="text-gray-400">
          Create and manage public updates shown on the homepage
        </p>
      </div>

      <Card className="bg-[var(--card)] border-[var(--border)] mb-8">
        <CardHeader>
          <CardTitle className="text-white">Create New Update</CardTitle>
          <CardDescription className="text-gray-400">
            Add event details, images, and call-to-action buttons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateForm />
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-4">All Updates</h2>
        <p className="text-sm text-gray-400 mb-4">
          {updates.length} total update{updates.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {updates.map((update) => (
          <Card
            key={update.id}
            className="bg-[var(--card)] border-[var(--border)] overflow-hidden hover:border-[var(--accent)] transition-colors"
          >
            <div className="relative aspect-video bg-muted">
              <Image
                src={update.image || "/placeholder.svg"}
                alt={update.title}
                fill
                className="object-cover"
              />
            </div>

            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={getStatusBadgeVariant(update.status)}>
                  {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                </Badge>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(update.eventDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(update.eventDate)}
                  </span>
                </div>
              </div>
              <CardTitle className="text-white text-lg line-clamp-2">
                {update.title}
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                /{update.slug}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                {update.excerpt}
              </p>
              <div className="flex flex-wrap gap-2">
                {update.ctaButtons.map((btn, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs rounded bg-[var(--primary)]/10 text-[var(--accent)] border border-[var(--border)]"
                  >
                    {btn.label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {updates.length === 0 && (
          <Card className="bg-[var(--card)] border-[var(--border)] md:col-span-2">
            <CardContent className="py-12 text-center text-gray-400">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No updates yet. Create your first update above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
