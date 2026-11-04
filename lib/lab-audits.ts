export type LabKind = "health" | "brand" | "offer"
export type LabItem = { label: string; value: string }
export type LabSection = { title: string; items: LabItem[] }

// A slim, serializable view of one 2026 lab submission. Identifiers such as user IDs stay on the server.
export type LabRow = {
  id: string
  kind: LabKind
  name: string
  email: string
  submittedAt: string | null
  /** The participant's key written output, previewed in the table. */
  summary: string
  /** Short answers such as health ratings. */
  facts: LabItem[]
  /** Key written outputs, shown prominently. */
  highlights: LabItem[]
  /** Every detailed answer, grouped as the form grouped them. */
  sections: LabSection[]
}

// These mirror the 2026 lab forms, which stored option values and answer keys rather than the wording.
const healthQuestions = [
  { id: "sleep", title: "Sleep", options: { excellent: "Excellent (7-9 hours, restful)", good: "Good (6-7 hours, mostly restful)", fair: "Fair (5-6 hours, sometimes restless)", poor: "Poor (<5 hours or chronically poor quality)" } },
  { id: "energy", title: "Energy", options: { consistent: "Consistent and high", moderate: "Moderate with minor dips", fluctuating: "Fluctuating significantly", low: "Consistently low or exhausted" } },
  { id: "stress", title: "Stress", options: { minimal: "Minimal - I manage stress well", moderate: "Moderate - manageable most days", high: "High - frequently overwhelmed", extreme: "Extreme - constant overwhelm" } },
  { id: "focus", title: "Focus", options: { excellent: "Excellent - Can focus for extended periods", good: "Good - Occasional distractions", fair: "Fair - Frequently distracted", poor: "Poor - Difficulty maintaining focus" } },
  { id: "exercise", title: "Exercise", options: { daily: "Daily or almost daily", "few-times": "Few times per week", occasionally: "Occasionally", rarely: "Rarely or never" } },
  { id: "nutrition", title: "Nutrition", options: { excellent: "Excellent - Balanced, mindful eating", good: "Good - Mostly healthy choices", fair: "Fair - Inconsistent", poor: "Poor - Irregular or unhealthy" } },
] as const satisfies readonly { id: string; title: string; options: Record<string, string> }[]

const brandSections = [
  { id: "clarity", title: "Clarity & Positioning", questions: ["What do you do? Can you explain it in one sentence?", "Who specifically is your ideal client/customer?", "What makes your approach different or unique?"] },
  { id: "brand", title: "Brand Signal", questions: ["How do you currently show up online? (Social, website, etc.)", "Does your brand look premium or commodity?", "What perception do you want people to have of you/your business?"] },
  { id: "offer", title: "Offer & Value", questions: ["What are you currently selling? (Products/Services)", "How do you price your offer?", "What specific problem does your offer solve?"] },
  { id: "systems", title: "Systems & Scale", questions: ["How do leads currently find you?", "What's your sales/conversion process?", "What are your biggest bottlenecks to scaling?"] },
  { id: "ai", title: "AI & Leverage", questions: ["Are you using AI in your business? If yes, how?", "What repetitive tasks take up most of your time?", "Where do you see AI helping you most?"] },
] as const

const offerSections = [
  { id: "target", title: "Target Client", questions: ["Who specifically is this offer for? (Be precise)", "What problem are they actively trying to solve right now?", "What have they already tried that didn't work?"] },
  { id: "transformation", title: "Core Transformation", questions: ["What specific outcome will they achieve?", "How will their business/life be different in 90 days?", "What's the most tangible proof of this transformation?"] },
  { id: "mechanism", title: "Delivery Mechanism", questions: ["What's your unique method/framework?", "How is this different from other solutions?", "What makes your approach faster/easier/better?"] },
  { id: "pricing", title: "Pricing & Structure", questions: ["What's your pricing model? (One-time, retainer, project-based)", "What's the specific investment range?", "What's included vs. what's extra?"] },
  { id: "execution", title: "Execution Roadmap", questions: ["What are the 3-5 milestones from kickoff to delivery? Include dates/owners.", "What weekly rituals keep this on track (standups, reviews, check-ins)?", "What resources or dependencies must be secured before starting?"] },
  { id: "kpis", title: "KPIs & Success Metrics", questions: ["What leading indicators show you're on track? (weekly activity/input metrics)", "What lagging indicators prove success? (outcomes, revenue, adoption)", "How will these be measured, by whom, and how often?"] },
  { id: "ai", title: "AI Leverage", questions: ["Where will AI accelerate delivery?", "What AI tools will you use in service delivery?", "How does AI enhance (not replace) your expertise?"] },
  { id: "risks", title: "Risks, Proof, and Controls", questions: ["What are the top 3 risks and your mitigations?", "What proof, social proof, or assets will build trust fast?", "What quality checks and review gates will you enforce?"] },
] as const

function text(value: unknown): string {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return ""
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function pick(container: unknown, key: string | number): string {
  return container && typeof container === "object" ? text((container as Record<string, unknown>)[key]) : ""
}

function titleize(key: string): string {
  const spaced = key.replace(/[_-]+/g, " ").trim()
  return spaced ? spaced[0].toUpperCase() + spaced.slice(1) : key
}

function items(entries: [string, string][]): LabItem[] {
  return entries.filter(([, value]) => value).map(([label, value]) => ({ label, value }))
}

function health(audit: Record<string, unknown>) {
  const answers = record(audit.answers)
  const known = new Set<string>(healthQuestions.map((question) => question.id))
  // The form stores these beside `answers`; older admin code looked inside it, so accept both.
  const redFlags = text(audit.redFlags) || text(answers.redFlags)
  const intentions = text(audit.intentions) || text(answers.intentions)
  const facts = [
    ...healthQuestions.flatMap((question) => {
      const value = text(answers[question.id])
      const options: Record<string, string> = question.options
      return value ? [{ label: question.title, value: options[value] ?? titleize(value) }] : []
    }),
    ...Object.entries(answers)
      .filter(([key, value]) => !known.has(key) && key !== "redFlags" && key !== "intentions" && text(value))
      .map(([key, value]) => ({ label: titleize(key), value: text(value) })),
  ]
  const sections: LabSection[] = []
  if (redFlags) sections.push({ title: "Red flag awareness", items: [{ label: "Are there any health concerns or warning signs you're currently aware of?", value: redFlags }] })
  if (intentions) sections.push({ title: "90-day performance intention", items: [{ label: "What specific health/performance improvements do you want to achieve in the next 90 days?", value: intentions }] })
  return { summary: intentions || redFlags, facts, highlights: [], sections }
}

function brand(audit: Record<string, unknown>) {
  const responses = record(audit.responses)
  const used = new Set<string>()
  const sections: LabSection[] = brandSections.map((section) => ({
    title: section.title,
    items: items(section.questions.map((question, index): [string, string] => {
      const key = `${section.id}_q${index + 1}`
      used.add(key)
      return [question, text(responses[key])]
    })),
  })).filter((section) => section.items.length)
  const other = items(Object.entries(responses).filter(([key]) => !used.has(key)).map(([key, value]): [string, string] => [titleize(key), text(value)]))
  if (other.length) sections.push({ title: "Other responses", items: other })
  // The form stores the commitment as `decision`; the original admin page looked for `decisionLock`.
  const decision = text(audit.decision) || text(audit.decisionLock)
  return {
    summary: decision, facts: [],
    highlights: items([["Decision lock: the one key decision or action they are committing to", decision]]),
    sections,
  }
}

function offer(audit: Record<string, unknown>) {
  const responses = record(audit.responses)
  const sections: LabSection[] = offerSections.map((section) => ({
    title: section.title,
    items: items(section.questions.map((question, index): [string, string] => [question, pick(responses[section.id], index)])),
  })).filter((section) => section.items.length)
  const known = new Set<string>(offerSections.map((section) => section.id))
  const other = items(Object.entries(responses).filter(([key]) => !known.has(key)).flatMap(([key, value]) =>
    Object.entries(record(value)).map(([index, answer]): [string, string] => [`${titleize(key)} ${index}`, text(answer)])))
  if (other.length) sections.push({ title: "Other responses", items: other })
  const offerStatement = text(audit.offerStatement)
  return {
    summary: offerStatement, facts: [],
    highlights: items([
      ["Offer statement", offerStatement],
      ["Execution decision", text(audit.decision)],
      ["Execution roadmap", text(audit.executionPlan)],
      ["Measurement & KPIs", text(audit.measurementPlan)],
    ]),
    sections,
  }
}

// Returns null for anything that is not a health, brand, or offer submission. `index` only names records without an ID.
export function toLabRow(input: unknown, index: number): LabRow | null {
  const audit = record(input)
  const kind = audit.type
  if (kind !== "health" && kind !== "brand" && kind !== "offer") return null
  const detail = kind === "health" ? health(audit) : kind === "brand" ? brand(audit) : offer(audit)
  return {
    id: text(audit.id) || `${kind}-${index}`,
    kind,
    name: text(audit.name) || "Unknown participant",
    email: text(audit.email),
    // Health and brand audits record createdAt/updatedAt; offers record timestamp.
    submittedAt: text(audit.updatedAt) || text(audit.timestamp) || text(audit.createdAt) || null,
    ...detail,
  }
}
