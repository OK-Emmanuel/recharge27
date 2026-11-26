import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft01Icon, ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SpeakerPortrait } from "@/components/speaker-portrait"
import { container } from "@/components/landing/section-heading"
import { findSpeaker, speakerNumber, speakers } from "@/lib/speakers"

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return speakers.map((speaker) => ({ slug: speaker.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const speaker = findSpeaker((await params).slug)
  if (!speaker) return {}
  return {
    title: `${speaker.placeholder ? speaker.sessionTitle : `${speaker.name} — ${speaker.sessionTitle}`} | Wealth Lab`,
    description: speaker.sessionFocus,
  }
}

export default async function SpeakerPage({ params }: Props) {
  const speaker = findSpeaker((await params).slug)
  if (!speaker) notFound()

  const index = speakers.indexOf(speaker)
  const previous = speakers[(index - 1 + speakers.length) % speakers.length]
  const next = speakers[(index + 1) % speakers.length]

  return (
    <>
      <SiteHeader />
      <main>
        <section className="atmosphere relative isolate overflow-hidden">
          <div className={`${container} relative z-10 py-12 sm:py-20`}>
            <Link href="/#speakers" className="inline-flex items-center gap-2 text-[0.72rem] tracking-[0.22em] text-mist uppercase transition-colors hover:text-accent-bright">
              <Icon icon={ArrowLeft01Icon} size={16} /> All speakers
            </Link>

            <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20">
              <SpeakerPortrait speaker={speaker} className="aspect-[4/5] w-full rounded-t-[10rem] rounded-b-xl border border-line" sizes="(min-width: 1024px) 26rem, 90vw" />

              <div className="flex flex-col justify-center">
                <p className="eyebrow">
                  Speaker {speakerNumber(speaker)} · {speaker.track}
                </p>
                <h1 className="section-title mt-5 text-5xl text-ivory sm:text-6xl lg:text-7xl">{speaker.name}</h1>
                <p className="mt-3 text-lg text-mist">{speaker.role}</p>
                {speaker.placeholder && (
                  <p className="mt-6 inline-flex w-fit items-center rounded-full border border-line px-4 py-1.5 text-[0.68rem] tracking-[0.22em] text-gold-deep uppercase">
                    Profile to be confirmed
                  </p>
                )}
                <div className="mt-10 space-y-4 text-lg leading-relaxed text-pretty text-mist">
                  {speaker.bio.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-line py-20 sm:py-28">
          <div className={`${container} grid gap-16 lg:grid-cols-2 lg:gap-24`}>
            <div>
              <p className="eyebrow">Professional background</p>
              <h2 className="section-title mt-4 text-3xl text-ivory sm:text-4xl">Experience & achievements</h2>
              <ul className="mt-8 divide-y divide-line border-y border-line">
                {speaker.background.map((item) => (
                  <li key={item} className="py-4 leading-relaxed text-mist">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow">The session</p>
              <h2 className="section-title mt-4 text-3xl text-ivory sm:text-4xl">{speaker.sessionTitle}</h2>
              <p className="mt-4 font-serif text-xl text-accent-bright italic">{speaker.sessionFocus}</p>
              <h3 className="mt-10 text-[0.72rem] tracking-[0.26em] text-gold-deep uppercase">What you will learn</h3>
              <ul className="mt-5 space-y-4">
                {speaker.expect.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed text-mist">
                    <Icon icon={Tick02Icon} size={20} className="mt-1 shrink-0 text-accent-bright" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-ink-soft py-16">
          <div className={`${container} flex flex-col items-start justify-between gap-8 md:flex-row md:items-center`}>
            <div>
              <h2 className="section-title text-3xl text-ivory sm:text-4xl">Be in the room.</h2>
              <p className="mt-2 text-mist">Seats are limited and the venue is shared with confirmed participants only.</p>
            </div>
            <Link href="/#tickets" className="btn-gold">
              Reserve your seat <Icon icon={ArrowRight01Icon} size={18} />
            </Link>
          </div>
        </section>

        <nav aria-label="More speakers" className="grid border-t border-line sm:grid-cols-2">
          {[
            { speaker: previous, label: "Previous", align: "text-left" },
            { speaker: next, label: "Next", align: "sm:text-right" },
          ].map(({ speaker: other, label, align }) => (
            <Link key={label} href={`/speakers/${other.slug}`} className={`group block px-6 py-10 transition-colors hover:bg-ink-soft sm:px-10 ${align} ${label === "Next" ? "sm:border-l sm:border-line" : ""}`}>
              <p className="text-[0.68rem] tracking-[0.26em] text-mist uppercase">{label}</p>
              <p className="mt-2 font-serif text-2xl text-ivory transition-colors group-hover:text-accent-bright">{other.sessionTitle}</p>
            </Link>
          ))}
        </nav>
      </main>
      <SiteFooter />
    </>
  )
}
