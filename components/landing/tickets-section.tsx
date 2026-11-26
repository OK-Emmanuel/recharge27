"use client"

import { useState } from "react"
import { ArrowRight01Icon, BedDoubleIcon, Tick02Icon } from "@hugeicons/core-free-icons"
import { CheckoutDialog } from "@/components/checkout-dialog"
import { Icon } from "@/components/icon"
import { Reveal } from "@/components/reveal"
import { container, SectionHeading } from "@/components/landing/section-heading"
import { formatNgn, formatUsd, ngn, NGN_PER_USD, tickets, type Ticket } from "@/lib/tickets"

export function TicketsSection() {
  const [selected, setSelected] = useState<Ticket | null>(null)

  return (
    <section id="tickets" className="border-t border-line bg-ink-soft py-24 sm:py-32">
      <div className={container}>
        <SectionHeading eyebrow="Tickets" title={<>Reserve your <em>seat.</em></>} align="center">
          Four ways into the room. Every ticket covers both days, with meals included.
        </SectionHeading>

        <ul className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {tickets.map((ticket, index) => (
            <Reveal
              as="li"
              key={ticket.id}
              delay={index * 100}
              className={`relative flex flex-col rounded-2xl p-8 ${ticket.featured ? "border border-gold-deep/60 bg-card shadow-[0_0_0_1px_var(--color-gold-deep)] xl:-translate-y-3" : "card-surface"}`}
            >
              {ticket.featured && (
                <span className="absolute -top-3 left-8 rounded-full bg-gold px-3 py-1 text-[0.62rem] tracking-[0.22em] text-[#2a2208] uppercase">
                  The complete experience
                </span>
              )}
              <p className="text-[0.68rem] tracking-[0.26em] text-accent-bright uppercase">{ticket.audience}</p>
              <h3 className="mt-3 font-serif text-3xl text-ivory">{ticket.name}</h3>

              <p className="mt-6 font-serif text-4xl font-light text-ivory">{formatNgn(ngn(ticket))}</p>
              <p className="mt-1 text-sm text-mist">
                {formatUsd(ticket.usd)}
                {ticket.id === "team" && <> &nbsp;·&nbsp; {formatNgn(ngn(ticket) / 8)} per person</>}
              </p>

              <p className="mt-6 text-sm leading-relaxed text-mist">{ticket.summary}</p>

              <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6 text-sm text-mist">
                {ticket.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3">
                    <Icon icon={Tick02Icon} size={18} className="mt-0.5 shrink-0 text-accent-bright" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <p className={`mt-6 flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs leading-snug ${ticket.accommodation === "included" ? "chip-gold" : "border border-line text-mist"}`}>
                <Icon icon={BedDoubleIcon} size={16} className="mt-px shrink-0" />
                {ticket.accommodation === "included"
                  ? "Complimentary accommodation included"
                  : "Accommodation not included. We will gladly help you secure a discount."}
              </p>

              <button type="button" onClick={() => setSelected(ticket)} className={`${ticket.featured ? "btn-gold" : "btn-ghost"} mt-6 w-full`}>
                Reserve {ticket.name} <Icon icon={ArrowRight01Icon} size={16} />
              </button>
            </Reveal>
          ))}
        </ul>

        <div className="mx-auto mt-12 grid max-w-5xl gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
          <div className="bg-card p-7">
            <h3 className="font-serif text-2xl text-ivory">Accommodation, made easy</h3>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Couples and VIP tickets include complimentary accommodation. If you hold a Standard or Team ticket, we are
              happy to help you secure discounted accommodation. Just ask once you are confirmed.
            </p>
          </div>
          <div className="bg-card p-7">
            <h3 className="font-serif text-2xl text-ivory">Pay your way</h3>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Prices are shown in naira and US dollars at {formatNgn(NGN_PER_USD)} to {formatUsd(1)}. Payments are processed
              securely in naira by Paystack, and you can commit in instalments from 50%.
            </p>
          </div>
        </div>
      </div>

      {selected && (
        <CheckoutDialog key={selected.id} ticket={selected} open onOpenChange={(open) => !open && setSelected(null)} />
      )}
    </section>
  )
}
