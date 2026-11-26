import Link from "next/link"
import { ArrowRight01Icon, Calendar03Icon, LockKeyIcon, Mic01Icon, UserGroupIcon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { container } from "@/components/landing/section-heading"
import { speakers } from "@/lib/speakers"
import { site } from "@/lib/site"

const facts = [
  { icon: Calendar03Icon, label: "Two days", detail: "Immersive, unhurried" },
  { icon: Mic01Icon, label: `${speakers.length} speakers`, detail: "Practitioners, not pundits" },
  { icon: UserGroupIcon, label: "A curated room", detail: "Limited seats" },
  { icon: LockKeyIcon, label: "Private venue", detail: "Revealed on confirmation" },
]

export function Hero() {
  return (
    <section className="atmosphere relative isolate overflow-hidden">
      <div className={`${container} relative z-10 pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-36`}>
        <p className="rise eyebrow flex items-center gap-4" style={{ "--delay": "100ms" } as React.CSSProperties}>
          <span className="inline-block h-px w-10 bg-accent" aria-hidden />
          {site.name} {site.edition} &nbsp;·&nbsp; By reservation
        </p>

        <h1
          className="rise section-title mt-8 text-[3.4rem] leading-[0.95] text-ivory sm:text-8xl lg:text-[9.5rem]"
          style={{ "--delay": "250ms" } as React.CSSProperties}
        >
          {site.theme}
          <span className="mt-3 block text-[1.6rem] font-light tracking-normal text-mist italic sm:text-4xl lg:text-5xl">
            — <em className="font-normal">{site.themeMeaning}.</em>
          </span>
        </h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <p
            className="rise max-w-xl text-lg leading-relaxed text-pretty text-mist sm:text-xl"
            style={{ "--delay": "450ms" } as React.CSSProperties}
          >
            Two days for people who build with intention. Sit with practitioners who have done it, test your thinking in
            a closed room, and leave with a sharper logic for wealth, influence and execution.
          </p>
          <div className="rise flex flex-wrap items-center gap-4 lg:justify-end" style={{ "--delay": "600ms" } as React.CSSProperties}>
            <Link href="/#tickets" className="btn-gold">
              Reserve your seat <Icon icon={ArrowRight01Icon} size={18} />
            </Link>
            <Link href="/#speakers" className="btn-ghost">
              Meet the speakers
            </Link>
          </div>
        </div>

        <ul
          className="rise mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4"
          style={{ "--delay": "800ms" } as React.CSSProperties}
        >
          {facts.map((fact) => (
            <li key={fact.label} className="flex items-center gap-4 bg-card px-5 py-6 sm:px-7">
              <Icon icon={fact.icon} size={26} className="shrink-0 text-gold-deep" />
              <div>
                <p className="font-serif text-xl text-ivory sm:text-2xl">{fact.label}</p>
                <p className="mt-0.5 text-xs text-mist">{fact.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
