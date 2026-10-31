"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error("Dashboard failed to load:", error) }, [error])
  return (
    <section role="alert" className="rounded border border-border bg-card p-8">
      <h1 className="text-2xl font-semibold mb-3">Unable to load dashboard data</h1>
      <p className="text-muted-foreground mb-6">Check the server database configuration and logs, then retry. No empty results have been substituted for this error.</p>
      <Button onClick={reset}>Try again</Button>
    </section>
  )
}
