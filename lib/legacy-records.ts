// Normalises the loosely typed 2026 `kv_store` records into slim, serializable rows for the admin tables.
// Account identifiers (userId) are deliberately left out so they never reach the browser.

function text(value: unknown): string {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return ""
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function numberOrNull(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

function rowId(value: unknown, prefix: string, index: number): string {
  return text(value) || `${prefix}-${index}`
}

export type LegacyFeedbackKind = "day1" | "final"
export type LegacyFeedbackRow = {
  id: string
  name: string
  email: string
  kind: LegacyFeedbackKind
  rating: number | null
  submittedAt: string | null
  mostValuable: string
  decision: string
  unclear: string
  testimonial: string
  canUseTestimonial: boolean
}

// Only day-1 reflections and final feedback exist; anything else is ignored, as before.
export function toFeedbackRow(input: unknown, index: number): LegacyFeedbackRow | null {
  const raw = record(input)
  if (raw.type !== "day1" && raw.type !== "final") return null
  return {
    id: rowId(raw.id, "feedback", index),
    name: text(raw.userName) || text(raw.name) || text(raw.email) || "Unknown participant",
    email: text(raw.email),
    kind: raw.type,
    rating: numberOrNull(raw.rating),
    submittedAt: text(raw.timestamp) || null,
    mostValuable: text(raw.mostValuable),
    decision: text(raw.decision),
    unclear: text(raw.unclear),
    testimonial: text(raw.testimonial),
    canUseTestimonial: raw.canUseTestimonial === true,
  }
}

export const attendanceDays: Record<number, string> = { 1: "3 Jan 2026", 2: "4 Jan 2026" }

export type AttendanceRow = {
  id: string
  name: string
  email: string
  day: number | null
  checkedInAt: string | null
  reflection: string
}

export function toAttendanceRow(input: unknown, index: number): AttendanceRow {
  const raw = record(input)
  return {
    id: rowId(raw.id, "attendance", index),
    name: text(raw.name) || text(raw.email) || "Unknown participant",
    email: text(raw.email),
    day: numberOrNull(raw.day),
    checkedInAt: text(raw.timestamp) || null,
    reflection: text(raw.reflection),
  }
}

export type ParticipantRow = {
  id: string
  name: string
  email: string
  status: string
  isAdmin: boolean
}

export function toParticipantRow(input: unknown, index: number): ParticipantRow {
  const raw = record(input)
  const name = `${text(raw.firstName)} ${text(raw.lastName)}`.trim()
  return {
    id: rowId(raw.id, "participant", index),
    name: name || text(raw.email) || "Unnamed participant",
    email: text(raw.email),
    status: text(raw.status).toLowerCase() || "unknown",
    isAdmin: text(raw.role) === "admin",
  }
}

export type AnnouncementRow = {
  id: string
  title: string
  message: string
  /** Lower-cased, normally "high", "medium", or "low". */
  priority: string
  postedAt: string | null
  postedBy: string
}

export function toAnnouncementRow(input: unknown, index: number): AnnouncementRow {
  const raw = record(input)
  return {
    id: rowId(raw.id, "announcement", index),
    title: text(raw.title) || "Untitled announcement",
    message: text(raw.message),
    priority: text(raw.priority).toLowerCase() || "unknown",
    postedAt: text(raw.timestamp) || null,
    postedBy: text(raw.postedBy),
  }
}

export type UpdateRow = {
  id: string
  slug: string
  title: string
  excerpt: string
  description: string
  image: string
  eventDate: string | null
  /** Lower-cased, normally "upcoming", "ongoing", or "past". */
  status: string
  buttons: { label: string; href: string }[]
  createdAt: string | null
  createdBy: string
}

export function toUpdateRow(input: unknown, index: number): UpdateRow {
  const raw = record(input)
  const buttons = Array.isArray(raw.ctaButtons)
    ? raw.ctaButtons.flatMap((button) => {
      const entry = record(button)
      const label = text(entry.label)
      const href = text(entry.href)
      return label || href ? [{ label: label || href, href }] : []
    })
    : []
  return {
    id: rowId(raw.id, "update", index),
    slug: text(raw.slug),
    title: text(raw.title) || "Untitled update",
    excerpt: text(raw.excerpt),
    description: text(raw.description),
    image: text(raw.image),
    eventDate: text(raw.eventDate) || null,
    status: text(raw.status).toLowerCase() || "unknown",
    buttons,
    createdAt: text(raw.timestamp) || null,
    createdBy: text(raw.createdBy),
  }
}

export type HotSeatRow = {
  id: string
  name: string
  email: string
  challenge: string
  context: string
  helpWanted: string
  selected: boolean
  submittedAt: string | null
  updatedAt: string | null
}

export function toHotSeatRow(input: unknown, index: number): HotSeatRow {
  const raw = record(input)
  return {
    id: rowId(raw.id, "hot-seat", index),
    name: text(raw.userName) || text(raw.email) || "Unknown participant",
    email: text(raw.email),
    challenge: text(raw.challenge),
    context: text(raw.context),
    helpWanted: text(raw.helpWanted),
    selected: raw.selected === true,
    submittedAt: text(raw.timestamp) || null,
    updatedAt: text(raw.updatedAt) || null,
  }
}

export type QuestionRow = {
  id: string
  question: string
  category: string
  anonymous: boolean
  /** Null for anonymous questions: they stay anonymous in the admin view too. */
  name: string | null
  answered: boolean
  askedAt: string | null
  answeredAt: string | null
  answeredBy: string
}

export function toQuestionRow(input: unknown, index: number): QuestionRow {
  const raw = record(input)
  const anonymous = raw.isAnonymous === true
  return {
    id: rowId(raw.id, "question", index),
    question: text(raw.question),
    category: text(raw.category) || "General",
    anonymous,
    name: anonymous ? null : text(raw.userName) || "Unknown participant",
    answered: raw.answered === true,
    askedAt: text(raw.timestamp) || null,
    answeredAt: text(raw.answeredAt) || null,
    answeredBy: text(raw.answeredBy),
  }
}
