import type React from "react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import PortalNav from "@/components/portal/portal-nav"

export const metadata = { title: "Admin Portal | Wealth Lab", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session || session.user?.role !== "admin") {
    redirect("/admin/login")
  }

  return <PortalNav user={session.user}>
    <p className="mb-6 rounded border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      2026 archive modules use the original shared records. Changes here also affect the old dashboard.
      2027 community feedback and Courtier applications are stored separately.
    </p>
    {children}
  </PortalNav>
}
