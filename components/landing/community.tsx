import Link from "next/link"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { Reveal } from "@/components/reveal"
import { container, SectionHeading } from "@/components/landing/section-heading"

const cards = [
  {
    href: "/your-voice",
    eyebrow: "Your Voice",
    title: "The room is shaped by its members.",
    text: "Wealth Lab is designed with the people it serves. If you have attended before, tell us what mattered, what could be better and what you want next. Your answers directly shape the programme.",
    cta: "Share your voice",
  },
  {
    href: "/wealth-courtiers",
    eyebrow: "The Wealth Courtiers",
    title: "Grace in conduct. Excellence in service.",
    text: "Our volunteers are trusted attendants who make the experience seamless. Agentic in action, they work behind the scenes and grow in the company of the room. Applications are reviewed carefully.",
    cta: "Become a Courtier",
  },
]

export function Community() {
  return (
    <section id="community" className="border-t border-line bg-ink-soft py-24 sm:py-32">
      <div className={container}>
        <SectionHeading eyebrow="The community" title={<>More than an event. <em>A standard.</em></>}>
          Wealth Lab is built by participants and volunteers who hold themselves to the same standard they come to learn.
        </SectionHeading>

        <ul className="mt-16 grid gap-6 lg:grid-cols-2">
          {cards.map((card, index) => (
            <Reveal as="li" key={card.href} delay={index * 120}>
              <Link href={card.href} className="card-surface group flex h-full flex-col rounded-2xl p-9 transition-colors duration-300 hover:border-accent-bright sm:p-12">
                <p className="eyebrow">{card.eyebrow}</p>
                <h3 className="section-title mt-5 text-3xl text-ivory sm:text-4xl">{card.title}</h3>
                <p className="mt-5 flex-1 leading-relaxed text-mist">{card.text}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-[0.72rem] tracking-[0.22em] text-gold-deep uppercase transition-all duration-300 group-hover:gap-3">
                  {card.cta} <Icon icon={ArrowUpRight01Icon} size={16} />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
