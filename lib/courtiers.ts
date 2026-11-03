export const courtierSkills = [
  "Event coordination and operations",
  "Guest relations and hospitality",
  "Communication and public relations",
  "Photography, videography, and content creation",
  "Graphic design and creative production",
  "Technical and audiovisual support",
  "Administration and logistics",
  "Research and documentation",
  "Protocol and guest management",
] as const

export const reviewStatuses = ["pending", "accepted", "declined"] as const
export type ReviewStatus = typeof reviewStatuses[number]

export const courtierQuestions = [
  { id: "experience", label: "Show us what you can do.", hint: "Describe a relevant project, your role, and the result.", max: 3000 },
  { id: "motivation", label: "Why do you want to serve as a Wealth Courtier?", hint: "What would you bring to the room?", max: 2000 },
  { id: "grace", label: "A guest is upset while the room is busy. What do you do?", hint: "How would you handle it with grace and discretion?", max: 2000 },
  { id: "agency", label: "You notice an important detail has been missed. What do you do?", hint: "Walk us through your next steps, including when you would involve the team.", max: 2000 },
  { id: "availability", label: "How can we count on you?", hint: "Share your availability for preparation, early arrival, and staying late, plus any constraints.", max: 2000 },
] as const

export type CourtierAnswers = Record<typeof courtierQuestions[number]["id"], string>
export type CourtierApplication = {
  submissionId: string
  fullName: string
  email: string
  portfolio: string
  skills: string[]
  answers: CourtierAnswers
  commitment: boolean
}

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

export function validSubmissionId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export function validateCourtier(body: unknown):
  { application: CourtierApplication; error?: never } | { error: string; application?: never } {
  if (!record(body) || !validSubmissionId(body.submissionId)) return { error: "Please reload the page and try again." }
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim() : ""
  if (!fullName || fullName.length > 200) return { error: "Please enter your full name (up to 200 characters)." }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "Please enter a valid email address." }
  if (!Array.isArray(body.skills) || !body.skills.length || body.skills.length > courtierSkills.length
    || !body.skills.every((skill): skill is string => typeof skill === "string" && courtierSkills.some((item) => item === skill))
    || new Set(body.skills).size !== body.skills.length) return { error: "Choose at least one skill you can contribute." }
  if (!record(body.answers)) return { error: "Please answer the evaluation questions." }
  const answers: CourtierAnswers = { experience: "", motivation: "", grace: "", agency: "", availability: "" }
  for (const question of courtierQuestions) {
    const value = body.answers[question.id]
    if (typeof value !== "string" || !value.trim() || value.length > question.max) {
      return { error: `Please answer “${question.label}” (up to ${question.max} characters).` }
    }
    answers[question.id] = value.trim()
  }
  if (typeof body.portfolio !== "string" || body.portfolio.length > 1000) return { error: "Please check your portfolio link." }
  const portfolio = body.portfolio.trim()
  if (portfolio) {
    try {
      const url = new URL(portfolio)
      if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return { error: "Use a public http or https portfolio link." }
    } catch {
      return { error: "Please enter a complete portfolio link, or leave it empty." }
    }
  }
  if (body.commitment !== true) return { error: "Please confirm that you understand the service commitment." }
  return { application: { submissionId: body.submissionId, fullName, email, portfolio, skills: body.skills, answers, commitment: true } }
}

export function validateCourtierReview(body: unknown):
  { review: { status: ReviewStatus; notes: string; version: number }; error?: never } | { error: string; review?: never } {
  if (!record(body)) return { error: "Choose a valid review status." }
  const status = reviewStatuses.find((status) => status === body.status)
  if (!status) return { error: "Choose a valid review status." }
  if (typeof body.notes !== "string" || body.notes.length > 5000) return { error: "Review notes must be at most 5,000 characters." }
  if (typeof body.version !== "number" || !Number.isSafeInteger(body.version) || body.version < 0) return { error: "Please refresh this application before reviewing it." }
  return { review: { status, notes: body.notes.trim(), version: body.version } }
}
