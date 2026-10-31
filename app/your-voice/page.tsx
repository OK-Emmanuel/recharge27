import type { Metadata } from "next"
import { IntelligenceForm } from "@/components/intelligence-form"
import "./voice.css"

const title = "Your Voice Matters | Wealth Lab"
const description = "Your voice. Your interests. Your Wealth Lab experience. Help us shape what's next."

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description },
  twitter: { card: "summary", title, description },
}

export default function YourVoicePage() {
  return <IntelligenceForm />
}
