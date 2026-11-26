"use client"

import { useEffect, useState } from "react"
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"

type Theme = "light" | "dark"

const STORAGE_KEY = "wl-theme"

function resolveTheme(): Theme {
  const pinned = document.documentElement.dataset.theme
  if (pinned === "light" || pinned === "dark") return pinned
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    setTheme(resolveTheme())
    // Follow the operating system until the visitor picks a theme manually.
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => setTheme(resolveTheme())
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  const toggle = () => {
    const next: Theme = resolveTheme() === "dark" ? "light" : "dark"
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
    setTheme(next)
  }

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode"

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme ? label : "Toggle colour theme"}
      title={theme ? label : undefined}
      className={`inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-line text-mist transition-colors duration-300 hover:border-accent-bright hover:text-accent-bright ${className}`}
    >
      {theme && <Icon icon={theme === "dark" ? Sun03Icon : Moon02Icon} size={18} />}
    </button>
  )
}
