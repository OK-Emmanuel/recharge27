import type { Metadata } from "next"
import Link from "next/link"
import { CourtierForm } from "@/components/courtier-form"
import { readCourtierSkills } from "@/lib/courtier-db"
import "./courtiers.css"

export const dynamic = "force-dynamic"
const title = "Become a Wealth Courtier | Wealth Lab"
const description = "Grace in conduct. Excellence in service. Agentic in action. Apply to serve as a Wealth Courtier."
export const metadata: Metadata = {
  title, description,
  openGraph: { title, description },
  twitter: { card: "summary", title, description },
}

export default async function WealthCourtiersPage() {
  const skills = await readCourtierSkills()
  return (
    <div className="courtier-page">
      <header className="courtier-header">
        <Link href="/" className="courtier-wordmark" aria-label="Wealth Lab home">WEALTH <span>LAB</span></Link>
        <a href="#apply">Become a Courtier</a>
      </header>
      <main>
        <section className="courtier-intro">
          <div className="courtier-title">
            <p className="courtier-eyebrow">The Wealth Courtiers</p>
            <h1>Become a<br />Wealth <em>Courtier.</em></h1>
            <p className="courtier-tagline">Grace in Conduct.<br />Excellence in Service.<br />Agentic in Action.</p>
            <div className="courtier-values" aria-label="Our three values"><span>01 Grace</span><span>02 Excellence</span><span>03 Agency</span></div>
          </div>
          <div className="courtier-invitation">
            <h2>Diligent Enough to<br /><em>Serve the Kings?</em></h2>
            <p>At The Wealth Lab, our volunteers are carefully selected. We call them Wealth Courtiers: skilled partners who uphold the standards, experience, and culture of the room.</p>
            <p>This is not a call for free access. Courtiers pay for their own access and choose to serve anyway. It is a call for intentional responsibility.</p>
            <p>If you will show up early, stay late, anticipate needs, and pay attention to the details that hold the room together, this invitation is for you.</p>
            <a className="courtier-primary" href="#apply">Apply to become a Courtier <span aria-hidden="true">&rarr;</span></a>
            <details className="courtier-details">
              <summary>What service means here</summary>
              <p>Leadership is revealed in responsibility. Contribution precedes authority. Excellence is often demonstrated in what people do when nobody is watching.</p>
              <p>This is not a paid office. We believe in reciprocating grace towards those who contribute meaningfully, through in-room benefits, access, process, and perspective. Specific benefits will be discussed with selected Courtiers.</p>
              <p>Courtiers are not here because they could not afford a ticket. They have paid for access and then chosen to serve.</p>
            </details>
          </div>
        </section>
        <section className="courtier-apply" id="apply" aria-labelledby="apply-title">
          <aside>
            <p className="courtier-eyebrow">Competence. Discretion. Initiative.</p>
            <h2 id="apply-title">Bring your skills.<br /><em>Help create the experience.</em></h2>
            <p>We appreciate your interest, but interest alone is not enough. Choose the skills you can genuinely contribute, then show us what you've done, and how you work.</p>
            <p>We value reliability, emotional intelligence, and a willingness to serve. Every application is reviewed manually.</p>
            <p className="courtier-small italic text-muted">Applying does not guarantee selection or admission. This form does not exclude you from purchasing your ticket.</p>
          </aside>
          <CourtierForm skills={skills} />
        </section>
      </main>
      <footer className="courtier-footer">The Wealth Lab 2027.</footer>
    </div>
  )
}
