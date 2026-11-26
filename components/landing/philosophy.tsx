import { Reveal } from "@/components/reveal"
import { container, SectionHeading } from "@/components/landing/section-heading"

const principles = [
  {
    word: "Think",
    text: "Wealth is a logic before it is a result. We examine how money, markets, risk and reputation really work, so decisions are made on reasoning, not rumour.",
  },
  {
    word: "Build",
    text: "Assets, brands, relationships and health compound when they are built deliberately. Each session turns an idea into something you can start constructing on Monday.",
  },
  {
    word: "Execute",
    text: "Insight without action is decoration. The room is designed to move you from understanding to commitment, with practitioners holding the standard.",
  },
]

export function Philosophy() {
  return (
    <section id="philosophy" className="border-t border-line py-24 sm:py-32">
      <div className={container}>
        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <SectionHeading eyebrow="The philosophy" title={<>Fortune sides with <em>him who dares.</em></>}>
            Ratio Fortunae is the logic of wealth: the idea that fortune is not an accident to be waited for, but a
            discipline to be studied, structured and practised. Wealth Lab exists for people willing to do that work in
            good company.
          </SectionHeading>

          <ol className="space-y-px overflow-hidden rounded-xl border border-line bg-line">
            {principles.map((principle, index) => (
              <Reveal as="li" key={principle.word} delay={index * 120} className="grid gap-4 bg-card p-7 sm:grid-cols-[8rem_1fr] sm:p-9">
                <span className="font-serif text-3xl font-light text-accent-bright">{principle.word}</span>
                <p className="leading-relaxed text-mist">{principle.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
