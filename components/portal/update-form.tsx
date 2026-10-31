"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, CheckCircle2, Plus, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CTAButton {
  label: string
  href: string
  variant: "default" | "outline" | "secondary" | "ghost"
}

export function UpdateForm() {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("14:00")
  const [status, setStatus] = useState<"upcoming" | "ongoing" | "past">("upcoming")
  const [ctaButtons, setCtaButtons] = useState<CTAButton[]>([
    { label: "View Details", href: "", variant: "default" },
    { label: "Join Community", href: "#pricing", variant: "outline" },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value)
    const autoSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    setSlug(autoSlug)
    
    // Update "View Details" button href
    setCtaButtons((prev) =>
      prev.map((btn, idx) =>
        idx === 0 ? { ...btn, href: `/updates/${autoSlug}` } : btn
      )
    )
  }

  const addCtaButton = () => {
    setCtaButtons([...ctaButtons, { label: "", href: "", variant: "outline" }])
  }

  const removeCtaButton = (index: number) => {
    setCtaButtons(ctaButtons.filter((_, i) => i !== index))
  }

  const updateCtaButton = (index: number, field: keyof CTAButton, value: string) => {
    setCtaButtons(
      ctaButtons.map((btn, i) => (i === index ? { ...btn, [field]: value } : btn))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitSuccess(false)

    try {
      // Combine date and time into ISO string
      const eventDateTime = new Date(`${eventDate}T${eventTime}:00.000Z`).toISOString()

      const response = await fetch("/api/admin/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          description,
          image,
          eventDate: eventDateTime,
          status,
          ctaButtons: ctaButtons.filter((btn) => btn.label && btn.href),
        }),
      })

      if (response.ok) {
        setSubmitSuccess(true)
        // Reset form
        setTitle("")
        setSlug("")
        setExcerpt("")
        setDescription("")
        setImage("")
        setEventDate("")
        setEventTime("14:00")
        setStatus("upcoming")
        setCtaButtons([
          { label: "View Details", href: "", variant: "default" },
          { label: "Join Community", href: "#pricing", variant: "outline" },
        ])

        // Refresh page after 1.5 seconds
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        alert("Failed to create update")
      }
    } catch (error) {
      console.error("Error creating update:", error)
      alert("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitSuccess && (
        <Alert className="bg-green-500/10 border-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-300">
            Update created successfully! Page will refresh...
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-white">
            Title *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., Virtual Audit & Re-Navigation Session"
            required
            className="bg-[var(--background)] border-[var(--border)] text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="text-white">
            Slug (auto-generated)
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="virtual-audit-feb-2026"
            required
            className="bg-[var(--background)] border-[var(--border)] text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt" className="text-white">
          Short Excerpt * (shown on cards)
        </Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief description for the card display..."
          required
          rows={2}
          className="bg-[var(--background)] border-[var(--border)] text-white resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">
          Full Description * (shown on detail page)
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Full description with multiple paragraphs (use double line breaks)..."
          required
          rows={6}
          className="bg-[var(--background)] border-[var(--border)] text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image" className="text-white">
          Image URL *
        </Label>
        <Input
          id="image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="/virtual-session-wealth-audit.jpg"
          required
          className="bg-[var(--background)] border-[var(--border)] text-white"
        />
        <p className="text-xs text-gray-400">
          Upload image to /public folder first, then enter path starting with /
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="eventDate" className="text-white">
            Event Date *
          </Label>
          <Input
            id="eventDate"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            className="bg-[var(--background)] border-[var(--border)] text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventTime" className="text-white">
            Event Time (UTC) *
          </Label>
          <Input
            id="eventTime"
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            required
            className="bg-[var(--background)] border-[var(--border)] text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-white">
            Status *
          </Label>
          <Select value={status} onValueChange={(value: any) => setStatus(value)}>
            <SelectTrigger className="bg-[var(--background)] border-[var(--border)] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-white">Call-to-Action Buttons</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCtaButton}
            className="text-sm"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Button
          </Button>
        </div>

        <div className="space-y-3">
          {ctaButtons.map((btn, index) => (
            <div key={index} className="grid md:grid-cols-[2fr,3fr,1fr,auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Label</Label>
                <Input
                  value={btn.label}
                  onChange={(e) => updateCtaButton(index, "label", e.target.value)}
                  placeholder="Button text"
                  className="bg-[var(--background)] border-[var(--border)] text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Link</Label>
                <Input
                  value={btn.href}
                  onChange={(e) => updateCtaButton(index, "href", e.target.value)}
                  placeholder="/path or #anchor"
                  className="bg-[var(--background)] border-[var(--border)] text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Style</Label>
                <Select
                  value={btn.variant}
                  onValueChange={(value) => updateCtaButton(index, "variant", value)}
                >
                  <SelectTrigger className="bg-[var(--background)] border-[var(--border)] text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="ghost">Ghost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {ctaButtons.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCtaButton(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[var(--primary)] hover:bg-[color-mix(in srgb,var(--primary) 90%, white 10%)] text-[var(--primary-foreground)] font-medium"
      >
        {isSubmitting ? (
          "Creating..."
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Create Update
          </>
        )}
      </Button>
    </form>
  )
}
