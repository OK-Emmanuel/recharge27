import type { Metadata } from "next"
import { CourtierPageContent } from "@/components/courtier-page-content"
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
  return <CourtierPageContent skills={skills} />
}
