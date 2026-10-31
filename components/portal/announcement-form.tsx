"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, CheckCircle2 } from "lucide-react"

export function AnnouncementForm() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitSuccess(false)

    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, priority }),
      })

      if (response.ok) {
        setSubmitSuccess(true)
        setTitle("")
        setMessage("")
        setPriority("medium")
        
        // Refresh page after 1 second
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        alert("Failed to post announcement")
      }
    } catch (error) {
      console.error("Error posting announcement:", error)
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
            Announcement posted successfully! Page will refresh...
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Session 2 Starting Soon"
          required
          className="bg-[var(--background)] border-[var(--border)] text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-white">
          Message
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your announcement message..."
          required
          rows={4}
          className="bg-[var(--background)] border-[var(--border)] text-white resize-none"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-white">Priority Level</Label>
        <RadioGroup value={priority} onValueChange={(value: any) => setPriority(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="high" className="border-red-500 text-red-500" />
            <Label htmlFor="high" className="text-gray-300 cursor-pointer">
              High (Urgent - Red alert)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" className="border-[var(--accent)] text-[var(--accent)]" />
            <Label htmlFor="medium" className="text-gray-300 cursor-pointer">
              Medium (Important - Gold alert)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="low" className="border-blue-400 text-blue-400" />
            <Label htmlFor="low" className="text-gray-300 cursor-pointer">
              Low (Informational - Blue alert)
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[var(--primary)] hover:bg-[color-mix(in srgb,var(--primary) 90%, white 10%)] text-[var(--primary-foreground)] font-medium"
      >
        <Send className="mr-2 h-4 w-4" />
        {isSubmitting ? "Posting..." : "Post Announcement"}
      </Button>
    </form>
  )
}
