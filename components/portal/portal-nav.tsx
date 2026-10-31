"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Home,
  CheckCircle,
  FlaskConical,
  FolderOpen,
  MessageSquare,
  Users,
  Bell,
  MessageCircle,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  SlidersHorizontal,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PortalNavProps {
  user: { role: string }
  children: ReactNode
}

const getNavItems = (isAdmin: boolean) => {
  if (isAdmin) {
    return [
      { href: "/admin/portal", label: "Admin Dashboard", icon: Home },
      { href: "/admin/portal/community-feedback", label: "2027 Feedback", icon: MessageCircle },
      { href: "/admin/portal/participants", label: "2026 Participants", icon: Users },
      { href: "/admin/portal/attendance", label: "Attendance", icon: CheckCircle },
      { href: "/admin/portal/labs", label: "Lab Submissions", icon: FlaskConical },
      { href: "/admin/portal/resources", label: "2026 Resources", icon: FolderOpen },
      { href: "/admin/portal/questions", label: "2026 Questions", icon: MessageSquare },
      { href: "/admin/portal/hot-seats", label: "2026 Hot Seats", icon: Users },
      { href: "/admin/portal/announcements", label: "Announcements", icon: Bell },
      { href: "/admin/portal/updates", label: "Manage Updates", icon: Megaphone },
      { href: "/admin/portal/features", label: "Feature Flags", icon: SlidersHorizontal },
      { href: "/admin/portal/feedback", label: "2026 Feedback", icon: MessageCircle },
      { href: "/admin/portal/export", label: "Exports", icon: FolderOpen },
    ]
  }
  
  return [
    { href: "/portal", label: "Welcome", icon: Home },
    { href: "/portal/attendance", label: "Check-In", icon: CheckCircle },
    { href: "/portal/labs", label: "Lab Experiments", icon: FlaskConical },
    { href: "/portal/resources", label: "Resources", icon: FolderOpen },
    { href: "/portal/questions", label: "Questions", icon: MessageSquare },
    { href: "/portal/hot-seats", label: "Hot Seats", icon: Users },
    { href: "/portal/announcements", label: "Updates", icon: Bell },
    { href: "/portal/feedback", label: "Feedback", icon: MessageCircle },
  ]
}

export default function PortalNav({ user, children }: PortalNavProps) {
  const navItems = getNavItems(user?.role === "admin")
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const navButtonStyles = (isActive: boolean) =>
    cn(
      "w-full justify-start transition-colors",
      collapsed ? "px-2" : "px-3",
      isActive
        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-foreground"
    )

  const desktopWidth = collapsed ? "lg:ml-20" : "lg:ml-72"
  const sidebarWidth = collapsed ? "lg:w-20" : "lg:w-72"

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-30 transition-opacity lg:hidden",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] transition-transform duration-200",
          "w-72", sidebarWidth,
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="text-lg font-semibold tracking-tight">{collapsed ? "WL" : "Wealth Lab"}</div>
            {user?.role === "admin" && !collapsed && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--accent)]/20 text-[var(--accent)]">
                Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex text-[var(--muted-foreground)]"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-[var(--muted-foreground)]"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                <Button asChild variant="ghost" className={navButtonStyles(isActive)}>
                  <span title={item.label} aria-current={isActive ? "page" : undefined}>
                  <Icon className="h-4 w-4" />
                  <span className={collapsed ? "sr-only" : "ml-3"}>{item.label}</span>
                  </span>
                </Button>
              </Link>
            )
          })}
        </div>

        <div className="border-t border-[var(--sidebar-border)] px-3 py-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--muted)]",
              collapsed && "px-2"
            )}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-3">Sign Out</span>}
          </Button>
        </div>
      </aside>

      <div className={cn("flex min-h-screen flex-1 flex-col", desktopWidth)}>
        <header className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Wealth Lab</p>
              <p className="text-base font-semibold text-foreground">Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-[var(--muted-foreground)]"
            onClick={() => signOut({ callbackUrl: "/" })}
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  )
}
