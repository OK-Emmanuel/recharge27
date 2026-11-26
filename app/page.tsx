import { Access } from "@/components/landing/access"
import { Community } from "@/components/landing/community"
import { Faq, FinalCta } from "@/components/landing/faq"
import { Hero } from "@/components/landing/hero"
import { Philosophy } from "@/components/landing/philosophy"
import { Programme } from "@/components/landing/programme"
import { SpeakersSection } from "@/components/landing/speakers-section"
import { TicketsSection } from "@/components/landing/tickets-section"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Philosophy />
        <Programme />
        <SpeakersSection />
        <TicketsSection />
        <Access />
        <Community />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
