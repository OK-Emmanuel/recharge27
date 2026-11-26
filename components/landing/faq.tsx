import Link from "next/link"
import { ArrowRight01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { container, SectionHeading } from "@/components/landing/section-heading"

const faqs = [
  {
    q: "Where is the event held?",
    a: "The venue is private and is shared only with confirmed participants, by email, ahead of the event. It is never published publicly.",
  },
  {
    q: "What does each ticket include?",
    a: "Every ticket covers two days of attendance with meals. Couples tickets cover both spouses. VIP includes every event benefit, including accommodation. Team tickets admit a team of eight.",
  },
  {
    q: "Is accommodation included?",
    a: "Couples and VIP tickets include complimentary accommodation. Standard and Team ticket holders are not covered, but we are happy to help you secure discounted accommodation.",
  },
  {
    q: "How are prices calculated?",
    a: "We keep a simple relationship of $1 to ₦1,000. Standard is ₦100,000 ($100), Couples ₦150,000 ($150), VIP ₦200,000 ($200) and Team ₦500,000 ($500). Payments are processed in naira.",
  },
  {
    q: "Can I pay in instalments?",
    a: "Yes. Choose “Pay in instalments” at checkout and commit at least 50% to secure your seat. The balance is due before the event begins.",
  },
  {
    q: "Who are the speakers?",
    a: "Eight practitioners lead eight sessions. Names are published on their profile pages as they are confirmed.",
  },
]

export function Faq() {
  return (
    <section id="faq" className="border-t border-line py-24 sm:py-32">
      <div className={`${container} grid gap-16 lg:grid-cols-[1fr_1.4fr]`}>
        <SectionHeading eyebrow="Questions" title={<>Before you <em>reserve.</em></>}>
          Anything else? We are glad to help.
        </SectionHeading>

        <div className="divide-y divide-line border-y border-line">
          {faqs.map((item) => (
            <details key={item.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-xl text-ivory sm:text-2xl [&::-webkit-details-marker]:hidden">
                {item.q}
                <Icon icon={PlusSignIcon} size={22} className="shrink-0 text-accent-bright transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="mt-4 max-w-2xl leading-relaxed text-mist">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FinalCta() {
  return (
    <section className="atmosphere relative isolate overflow-hidden border-t border-line py-24 text-center sm:py-32">
      <div className={`${container} relative z-10`}>
        <p className="eyebrow">Ratio Fortunae</p>
        <h2 className="section-title mx-auto mt-6 max-w-4xl text-5xl text-ivory sm:text-7xl">
          The seat is yours <em>if you dare.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">Two days. Eight voices. One logic for building wealth that lasts.</p>
        <Link href="/#tickets" className="btn-gold mt-10">
          Reserve your seat <Icon icon={ArrowRight01Icon} size={18} />
        </Link>
      </div>
    </section>
  )
}
