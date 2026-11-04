export type FeedbackEntry = { key: string; label: string; value: string | string[] }
export type FeedbackSection = { title: string; entries: FeedbackEntry[] }

type StageShape = { title: string; groups: readonly (readonly { id: string; label: string }[])[] }
type FacilitatorShape = { name: string }

const FACILITATOR_ANCHOR = "facilitator_particular_interests"

function normalise(value: unknown): string | string[] | null {
  if (typeof value === "string") return value.trim() ? value : null
  if (Array.isArray(value)) {
    const items = value.map(String).filter((item) => item.trim())
    return items.length ? items : null
  }
  return value === null || value === undefined ? null : String(value)
}

// Lays out one response in the order the respondent saw the questions. Stages, labels, and facilitator
// keys are passed in so this stays free of imports. Unknown keys are kept in a trailing section.
export function buildFeedbackSections(
  answers: Record<string, unknown>,
  stages: readonly StageShape[],
  facilitators: readonly FacilitatorShape[],
): FeedbackSection[] {
  const remaining = new Map<string, string | string[]>()
  for (const [key, value] of Object.entries(answers)) {
    const normalised = normalise(value)
    if (normalised !== null) remaining.set(key, normalised)
  }

  const take = (key: string, label: string): FeedbackEntry[] => {
    const value = remaining.get(key)
    if (value === undefined) return []
    remaining.delete(key)
    return [{ key, label, value }]
  }

  const facilitatorEntries = facilitators.flatMap((facilitator, index) =>
    take(`facilitator_interest_${index + 1}_${facilitator.name.replaceAll(" ", "_").toLowerCase()}`, `Interest in ${facilitator.name}`))

  const sections: FeedbackSection[] = []
  let facilitatorsPlaced = false
  for (const stage of stages) {
    const questions = stage.groups.flat()
    const entries = questions.flatMap((question) => [
      ...take(question.id, question.label),
      ...take(`${question.id}_other`, `${question.label} (Other)`),
    ])
    // Facilitator cards come first in the form, so they lead the stage that asks about facilitators.
    if (!facilitatorsPlaced && questions.some((question) => question.id === FACILITATOR_ANCHOR)) {
      entries.unshift(...facilitatorEntries)
      facilitatorsPlaced = true
    }
    if (entries.length) sections.push({ title: stage.title, entries })
  }
  if (!facilitatorsPlaced && facilitatorEntries.length) sections.push({ title: "Facilitator interest", entries: facilitatorEntries })

  if (remaining.size) {
    sections.push({
      title: "Other answers",
      entries: [...remaining].map(([key, value]) => ({ key, label: key.replaceAll("_", " "), value })),
    })
  }
  return sections
}

export function countEntries(sections: readonly FeedbackSection[]): number {
  return sections.reduce((total, section) => total + section.entries.length, 0)
}
