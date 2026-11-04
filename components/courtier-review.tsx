"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { reviewStatuses, type ReviewStatus } from "@/lib/courtiers"
import { useUnsavedChanges } from "@/components/admin/detail-drawer"
import { Button } from "@/components/ui/button"

export function CourtierReview({ id, status: initialStatus, notes: initialNotes, version, onSaved }: {
  id: string; status: ReviewStatus; notes: string; version: number
  /** Called after the decision is saved, with the status that was saved. */
  onSaved?: (status: ReviewStatus) => void
}) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [notes, setNotes] = useState(initialNotes)
  // What is stored, so a just-saved form is not reported as unsaved while the page refreshes.
  const [saved, setSaved] = useState({ status: initialStatus, notes: initialNotes })
  useUnsavedChanges(status !== saved.status || notes !== saved.notes)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [failed, setFailed] = useState(false)
  const lock = useRef(false)
  const fieldClass = "w-full mt-2 rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current) return
    lock.current = true
    setSaving(true)
    setMessage("")
    setFailed(false)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20_000)
    try {
      const response = await fetch(`/api/admin/wealth-courtiers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes, version }),
        signal: controller.signal,
      })
      const result: unknown = await response.json()
      if (!response.ok || !result || typeof result !== "object" || !("ok" in result) || result.ok !== true) {
        throw new Error(result && typeof result === "object" && "error" in result && typeof result.error === "string"
          ? result.error : "Could not confirm the review was saved.")
      }
      setMessage("Review saved.")
      setSaved({ status, notes })
      onSaved?.(status)
      router.refresh()
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error && error.name === "AbortError"
        ? "Could not confirm the review in time. Refresh to check its status before retrying."
        : error instanceof Error ? error.message : "Could not save review.")
    } finally {
      window.clearTimeout(timeout)
      lock.current = false
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save}>
      <fieldset disabled={saving} className="space-y-4">
        <label className="block text-sm font-medium" htmlFor={`status-${id}`}>Manual decision
          <select id={`status-${id}`} className={fieldClass} value={status} onChange={(event) => {
            const next = reviewStatuses.find((item) => item === event.target.value)
            if (next) setStatus(next)
          }}>
            {reviewStatuses.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium" htmlFor={`notes-${id}`}>Internal review notes
          <textarea id={`notes-${id}`} className={fieldClass} rows={3} maxLength={5000} value={notes}
            onChange={(event) => setNotes(event.target.value)} />
        </label>
        <p className="text-sm text-muted-foreground">Notes stay private. Saving a decision does not email the applicant.</p>
        <div className="flex flex-wrap gap-4 items-center">
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save review"}</Button>
          <Button type="button" variant="outline" disabled={saving} onClick={() => router.refresh()}>Refresh application</Button>
        </div>
      </fieldset>
      {message && <p className={`mt-4 text-sm ${failed ? "text-danger" : "text-accent-bright"}`} role={failed ? "alert" : "status"}>{message}</p>}
    </form>
  )
}
