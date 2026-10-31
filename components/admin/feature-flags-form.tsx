"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { FeatureFlags } from "@/lib/feature-flags"

type FeatureFlagKey = keyof FeatureFlags

const FEATURE_LABELS: Array<{ key: FeatureFlagKey; title: string; description: string }> = [
  {
    key: "loginEnabled",
    title: "Portal Login Access",
    description: "Allow non-admin users to log in to the portal.",
  },
  {
    key: "attendanceEnabled",
    title: "Attendance Check-In",
    description: "Allow participants to submit attendance check-ins.",
  },
  {
    key: "labSubmissionsEnabled",
    title: "Lab Activity Submissions",
    description: "Allow participants to submit or update lab responses.",
  },
  {
    key: "questionsEnabled",
    title: "Questions Module",
    description: "Allow participants to ask questions in the Questions Desk.",
  },
  {
    key: "hotSeatsEnabled",
    title: "Hot Seats",
    description: "Allow participants to submit or update hot seat requests.",
  },
  {
    key: "feedbackEnabled",
    title: "Feedback Form",
    description: "Allow participants to submit feedback and reflections.",
  },
  {
    key: "commitmentEnabled",
    title: "Welcome Commitment",
    description: "Allow participants to submit commitment acknowledgment.",
  },
]

interface FeatureFlagsFormProps {
  initialFlags: FeatureFlags
}

export default function FeatureFlagsForm({ initialFlags }: FeatureFlagsFormProps) {
  const [flags, setFlags] = useState<FeatureFlags>(initialFlags)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const onToggle = (key: FeatureFlagKey, checked: boolean) => {
    setFlags((prev) => ({ ...prev, [key]: checked }))
  }

  const onSave = async () => {
    setSaving(true)
    setMessage("")

    try {
      const response = await fetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flags),
      })

      if (!response.ok) {
        throw new Error("Failed to save feature flags")
      }

      const data = await response.json()
      setFlags(data.flags)
      setMessage("Feature flags updated successfully.")
    } catch (error) {
      setMessage("Unable to save changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-[var(--card)] border-[var(--border)]">
      <CardHeader>
        <CardTitle className="text-white">Feature Controls</CardTitle>
        <CardDescription className="text-gray-400">
          Enable or disable key participant-facing features instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {FEATURE_LABELS.map((item) => (
          <div key={item.key} className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0">
            <div className="space-y-1">
              <Label htmlFor={item.key} className="text-white text-sm font-medium">
                {item.title}
              </Label>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
            <Checkbox
              id={item.key}
              checked={flags[item.key]}
              onCheckedChange={(value) => onToggle(item.key, value === true)}
              className="mt-1"
            />
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          {message && <p className="text-sm text-gray-400">{message}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
