"use client"

import { useState } from "react"
import Link from "next/link"
import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { site } from "@/lib/site"

export const navLinks = [
  { href: "/#philosophy", label: "Philosophy" },
  { href: "/#programme", label: "Programme" },
  { href: "/#speakers", label: "Speakers" },
  { href: "/#tickets", label: "Tickets" },
  { href: "/#access", label: "Access" },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:h-20 sm:px-10">
        <Link href="/" className="font-serif text-lg tracking-[0.32em] text-ivory uppercase sm:text-xl" aria-label={`${site.name} home`}>
          {site.name}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-[0.72rem] tracking-[0.22em] text-mist uppercase transition-colors duration-300 hover:text-accent-bright">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/#tickets" className="btn-gold hidden sm:inline-flex">
            Reserve your seat
          </Link>
          <button
            type="button"
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-line text-ivory lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon icon={open ? Cancel01Icon : Menu01Icon} size={20} />
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line/70 bg-ink px-6 py-6 lg:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)} className="block py-3 font-serif text-2xl text-ivory">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/#tickets" onClick={() => setOpen(false)} className="btn-gold mt-4 w-full">
            Reserve your seat
          </Link>
        </nav>
      )}
    </header>
  )
}
