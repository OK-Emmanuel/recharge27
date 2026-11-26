import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { site } from "@/lib/site"

const linkClass = "text-mist transition-colors duration-300 hover:text-accent-bright"

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink-soft">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl tracking-[0.32em] text-ivory uppercase">{site.name}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist">
            {site.theme} — {site.themeMeaning}. A private gathering for those who build with intention, and who value the
            company they keep.
          </p>
          <p className="mt-6 max-w-sm text-xs leading-relaxed text-mist/80">
            The venue is shared only with confirmed participants.
          </p>
        </div>

        <nav aria-label="Event" className="text-sm">
          <p className="eyebrow mb-5">The event</p>
          <ul className="space-y-3">
            <li><Link href="/#philosophy" className={linkClass}>Philosophy</Link></li>
            <li><Link href="/#programme" className={linkClass}>Programme</Link></li>
            <li><Link href="/#speakers" className={linkClass}>Speakers</Link></li>
            <li><Link href="/#tickets" className={linkClass}>Tickets</Link></li>
            <li><Link href="/#faq" className={linkClass}>Questions</Link></li>
          </ul>
        </nav>

        <nav aria-label="Community" className="text-sm">
          <p className="eyebrow mb-5">Community</p>
          <ul className="space-y-3">
            <li><Link href="/your-voice" className={linkClass}>Your Voice</Link></li>
            <li><Link href="/wealth-courtiers" className={linkClass}>Wealth Courtiers</Link></li>
            {site.archive2026Url && (
              <li><a href={site.archive2026Url} className={linkClass}>The 2026 Archive</a></li>
            )}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 sm:px-10">
          <p className="text-[0.68rem] tracking-[0.2em] text-mist/80 uppercase">
            &copy; {site.edition} {site.name}
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
