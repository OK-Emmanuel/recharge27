import { Mail01Icon, SquareLock02Icon, Ticket01Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { Reveal } from "@/components/reveal"
import { container, SectionHeading } from "@/components/landing/section-heading"

const steps = [
  { icon: Ticket01Icon, title: "Reserve your seat", text: "Choose a ticket and complete your payment securely." },
  { icon: Mail01Icon, title: "Receive confirmation", text: "Confirmed participants hear from us directly by email." },
  { icon: SquareLock02Icon, title: "Learn the venue", text: "The venue is revealed to you, and only you, ahead of the event." },
]

export function Access() {
  return (
    <section id="access" className="border-t border-line py-24 sm:py-32">
      <div className={container}>
        <SectionHeading eyebrow="Private by design" title={<>The venue is for <em>the room.</em></>} align="center">
          Wealth Lab is deliberately closed. The venue is never published. It is shared only with confirmed participants,
          so the conversations inside stay candid and the company stays curated.
        </SectionHeading>

        <ol className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 120} className="card-surface relative rounded-xl p-8 text-center">
              <span className="absolute top-4 left-5 font-serif text-sm text-gold-deep">0{index + 1}</span>
              <Icon icon={step.icon} size={32} className="mx-auto text-accent-bright" />
              <h3 className="mt-5 font-serif text-2xl text-ivory">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
