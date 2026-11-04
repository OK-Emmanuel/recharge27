import assert from "node:assert/strict"
import test from "node:test"
import { toLabRow } from "../lib/lab-audits.ts"

test("health audits show readable ratings and read the fields the 2026 form really stores", () => {
  const row = toLabRow({
    id: "HEALTH-1", userId: "secret-user-id", type: "health", name: " Ada Obi ", email: "ada@example.test",
    answers: { sleep: "poor", energy: "moderate", stress: "extreme", focus: "good", exercise: "few-times", nutrition: "unheard-of" },
    redFlags: "Persistent fatigue", intentions: "Sleep better",
    createdAt: "2026-01-02T10:00:00.000Z", updatedAt: "2026-01-03T09:00:00.000Z",
  }, 0)
  assert.equal(row.id, "HEALTH-1")
  assert.equal(row.kind, "health")
  assert.equal(row.name, "Ada Obi")
  assert.equal(row.submittedAt, "2026-01-03T09:00:00.000Z")
  assert.deepEqual(row.facts.slice(0, 2), [
    { label: "Sleep", value: "Poor (<5 hours or chronically poor quality)" },
    { label: "Energy", value: "Moderate with minor dips" },
  ])
  assert.deepEqual(row.facts.find((fact) => fact.label === "Exercise"), { label: "Exercise", value: "Few times per week" })
  assert.deepEqual(row.facts.find((fact) => fact.label === "Nutrition"), { label: "Nutrition", value: "Unheard of" })
  assert.deepEqual(row.sections.map((section) => section.title), ["Red flag awareness", "90-day performance intention"])
  assert.equal(row.summary, "Sleep better")
  assert.equal(JSON.stringify(row).includes("secret-user-id"), false, "user IDs never reach the browser")
})

test("health audits still read red flags and intentions kept inside answers, and ignore empty ones", () => {
  const row = toLabRow({ id: "H", type: "health", answers: { sleep: "good", redFlags: "Back pain", intentions: "  ", extra: "kept" } }, 0)
  assert.equal(row.summary, "Back pain")
  assert.deepEqual(row.sections.map((section) => section.title), ["Red flag awareness"])
  assert.deepEqual(row.facts.map((fact) => fact.label), ["Sleep", "Extra"])
  assert.equal(row.submittedAt, null)
})

test("brand audits use the stored decision (or the legacy decisionLock), only answered questions, and keep unknown keys", () => {
  const row = toLabRow({
    id: "BRAND-1", type: "brand", name: "Bola", email: "bola@example.test", createdAt: "2026-01-02T10:00:00.000Z",
    decision: "Raise prices", responses: { clarity_q1: "We help founders", clarity_q3: "Speed", ai_q2: "Admin", legacy_note: "Hello" },
  }, 3)
  assert.equal(row.summary, "Raise prices")
  assert.equal(row.highlights[0].value, "Raise prices")
  assert.deepEqual(row.sections.map((section) => section.title), ["Clarity & Positioning", "AI & Leverage", "Other responses"])
  assert.deepEqual(row.sections[0].items, [
    { label: "What do you do? Can you explain it in one sentence?", value: "We help founders" },
    { label: "What makes your approach different or unique?", value: "Speed" },
  ])
  assert.deepEqual(row.sections[2].items, [{ label: "Legacy note", value: "Hello" }])
  assert.equal(row.submittedAt, "2026-01-02T10:00:00.000Z")
  assert.equal(toLabRow({ id: "B", type: "brand", decisionLock: "Old field name" }, 0).summary, "Old field name")
})

test("offer audits read nested responses and written outputs, and fall back to the timestamp", () => {
  const row = toLabRow({
    type: "offer", name: "Chidi", offerStatement: "I help X", decision: "Call 5 founders", executionPlan: "", measurementPlan: "Weekly",
    timestamp: "2026-01-04T08:00:00.000Z",
    responses: { target: { 0: "Founders", 2: "Cold emails" }, risks: ["Low attendance"], mystery: { 1: "Stray" } },
  }, 7)
  assert.equal(row.id, "offer-7")
  assert.equal(row.submittedAt, "2026-01-04T08:00:00.000Z")
  assert.equal(row.summary, "I help X")
  assert.deepEqual(row.highlights.map((item) => item.label), ["Offer statement", "Execution decision", "Measurement & KPIs"])
  assert.deepEqual(row.sections.map((section) => section.title), ["Target Client", "Risks, Proof, and Controls", "Other responses"])
  assert.deepEqual(row.sections[0].items.map((item) => item.value), ["Founders", "Cold emails"])
  assert.deepEqual(row.sections[1].items, [{ label: "What are the top 3 risks and your mitigations?", value: "Low attendance" }])
  assert.deepEqual(row.sections[2].items, [{ label: "Mystery 1", value: "Stray" }])
})

test("unknown or malformed records are skipped or tolerated rather than crashing the page", () => {
  for (const input of [null, undefined, "text", 5, [], {}, { type: "survey" }, { type: "HEALTH" }]) assert.equal(toLabRow(input, 0), null, JSON.stringify(input))
  const sparse = toLabRow({ type: "brand", answers: 5, responses: "nope", name: 12, email: null }, 1)
  assert.deepEqual([sparse.id, sparse.name, sparse.email, sparse.summary, sparse.sections], ["brand-1", "12", "", "", []])
  assert.equal(toLabRow({ type: "offer", responses: null }, 2).sections.length, 0)
})
