export const EMPTY_VALUE = "—"

// Fixed locale and UTC keep server and browser output identical, which avoids hydration mismatches.
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  hourCycle: "h23", timeZone: "UTC", timeZoneName: "short",
})
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC", timeZoneName: "short",
})

// Accepts Dates, epoch milliseconds, ISO strings, and Postgres `timestamptz::text` output.
export function parseTimestamp(value: unknown): Date | null {
  let date: Date
  if (value instanceof Date) date = value
  else if (typeof value === "number") date = new Date(value)
  else if (typeof value === "string" && value.trim()) {
    // Postgres prints "2026-11-04 08:12:33.123456+00". Safari rejects that, so normalise it to ISO 8601.
    date = new Date(value.trim().replace(" ", "T").replace(/(T[\d:.]+)([+-]\d{2})$/, "$1$2:00").replace(/(\.\d{3})\d+/, "$1"))
  } else return null
  return Number.isNaN(date.getTime()) ? null : date
}

export function timestampValue(value: unknown): number | null {
  return parseTimestamp(value)?.getTime() ?? null
}

export function formatDate(value: unknown): string {
  const date = parseTimestamp(value)
  return date ? dateFormat.format(date) : EMPTY_VALUE
}

export function formatDateTime(value: unknown): string {
  const date = parseTimestamp(value)
  return date ? dateTimeFormat.format(date) : EMPTY_VALUE
}

export function formatTime(value: unknown): string {
  const date = parseTimestamp(value)
  return date ? timeFormat.format(date) : EMPTY_VALUE
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  const first = [...words[0]][0]
  const last = words.length > 1 ? [...words[words.length - 1]][0] : ""
  return (first + last).toUpperCase()
}

// Turns stored identifiers such as "few-times" or "clarity_q1" into readable text.
export function humanize(value: string): string {
  const text = value.replace(/[_-]+/g, " ").trim()
  return text ? text[0].toUpperCase() + text.slice(1) : EMPTY_VALUE
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

// Links built from stored data must never run script. Only web, mail, and same-site paths are linked.
export function safeHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const href = value.trim()
  return /^(https?:\/\/|mailto:|\/(?![/\\]))/i.test(href) ? href : undefined
}
