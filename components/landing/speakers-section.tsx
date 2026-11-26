import Link from "next/link"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { Reveal } from "@/components/reveal"
import { container, SectionHeading } from "@/components/landing/section-heading"
import { SpeakerPortrait } from "@/components/speaker-portrait"
import { speakerNumber, speakers } from "@/lib/speakers"

export function SpeakersSection() {
  return (
    <section id="speakers" className="border-t border-line py-24 sm:py-32">
      <div className={container}>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow="The voices" title={<>Eight sessions. <em>Eight practitioners.</em></>}>
            Each speaker leads one session on a discipline they have practised, not just studied. Names are announced as they are confirmed.
          </SectionHeading>
          <Link href="/#tickets" className="btn-ghost self-start lg:self-auto">
            Secure your seat
          </Link>
        </div>

        <ul className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {speakers.map((speaker, index) => (
            <Reveal as="li" key={speaker.slug} delay={(index % 4) * 100} className="lg:[&:nth-child(4n+2)]:mt-12 lg:[&:nth-child(4n+4)]:mt-12">
              <Link href={`/speakers/${speaker.slug}`} className="speaker-card group block" aria-label={`${speaker.name}: ${speaker.sessionTitle}`}>
                <div className="relative">
                  <SpeakerPortrait speaker={speaker} className="aspect-[4/5] rounded-t-[8rem] rounded-b-xl border border-line transition-colors duration-500 group-hover:border-accent-bright" sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw" />
                  <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[0.65rem] tracking-[0.3em] text-mist uppercase">
                    {speakerNumber(speaker)} / 0{speakers.length}
                  </span>
                </div>
                <p className="mt-6 text-[0.68rem] tracking-[0.26em] text-accent-bright uppercase">{speaker.track}</p>
                <h3 className="mt-2 font-serif text-2xl leading-tight text-ivory">{speaker.name}</h3>
                <p className="mt-1 text-sm text-mist">{speaker.role}</p>
                <p className="mt-4 border-t border-line pt-4 text-sm leading-snug text-ivory">{speaker.sessionTitle}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-[0.7rem] tracking-[0.2em] text-gold-deep uppercase transition-all duration-300 group-hover:gap-3">
                  View profile <Icon icon={ArrowUpRight01Icon} size={16} />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
