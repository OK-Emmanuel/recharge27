import { Chat01Icon, Door01Icon, UserMultiple02Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { Reveal } from "@/components/reveal"
import { container, SectionHeading } from "@/components/landing/section-heading"

const areas = [
  {
    title: "Financial Intelligence & Wealth Investment",
    line: "Understanding money. Building assets. Securing the future.",
    text: "Structure, grow and protect wealth across a lifetime, from investing to tax to retirement you prepare for on purpose.",
  },
  {
    title: "Health, Protection & Longevity",
    line: "Protecting your life. Preserving your health. Extending your capacity.",
    text: "Insurance, prevention and sustainable living. Wealth is only useful to those with the health to enjoy it.",
  },
  {
    title: "Influence, Etiquette & Elite Conduct",
    line: "Conduct, communication, relationships and access.",
    text: "Access is one thing. Knowing how to conduct yourself once you have it is another. Learn the standards of influential rooms.",
  },
  {
    title: "Brand, Authority & Power",
    line: "Credibility in the age of AI, and clarity on business politics.",
    text: "Build a brand people trust, and read the power dynamics behind every serious negotiation.",
  },
]

const experiences = [
  {
    icon: Chat01Icon,
    title: "Panel & Interactive Q&A",
    text: "A closed-room conversation. Ideas are questioned, not just delivered, with direct access to the people on stage.",
  },
  {
    icon: UserMultiple02Icon,
    title: "The Three Circles",
    text: "Collaborative challenge. Work in teams on a real scenario, present your solution under pressure, and compete for the prize.",
  },
  {
    icon: Door01Icon,
    title: "The Hot Seat",
    text: "A real business, a real challenge. One participant is examined by the room, and offered practical help, not just opinions.",
  },
]

export function Programme() {
  return (
    <section id="programme" className="border-t border-line bg-ink-soft py-24 sm:py-32">
      <div className={container}>
        <SectionHeading eyebrow="The programme" title={<>Four disciplines. <em>One logic.</em></>}>
          The sessions are curated as a single argument about how wealth is created, protected and carried with grace.
        </SectionHeading>

        <ol className="mt-16 divide-y divide-line border-y border-line">
          {areas.map((area, index) => (
            <Reveal as="li" key={area.title} className="grid gap-4 py-9 md:grid-cols-[5rem_1.2fr_1fr] md:gap-10">
              <span className="font-serif text-4xl font-light text-gold-deep">0{index + 1}</span>
              <div>
                <h3 className="font-serif text-2xl text-ivory sm:text-3xl">{area.title}</h3>
                <p className="mt-2 text-sm tracking-wide text-accent-bright">{area.line}</p>
              </div>
              <p className="leading-relaxed text-mist">{area.text}</p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-24">
          <Reveal>
            <p className="eyebrow">Beyond the stage</p>
            <h3 className="section-title mt-4 text-3xl text-ivory sm:text-4xl">Interactive by design</h3>
          </Reveal>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {experiences.map((item, index) => (
              <Reveal as="li" key={item.title} delay={index * 120} className="card-surface rounded-xl p-8 transition-colors duration-300 hover:border-accent-bright">
                <Icon icon={item.icon} size={30} className="text-gold-deep" />
                <h4 className="mt-6 font-serif text-2xl text-ivory">{item.title}</h4>
                <p className="mt-3 leading-relaxed text-mist">{item.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
