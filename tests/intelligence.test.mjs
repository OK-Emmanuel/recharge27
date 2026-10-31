import assert from "node:assert/strict"
import test from "node:test"
import { feedbackPayload, facilitators, isVisible, parseDraft, parseProgress, pillars, stages } from "../lib/intelligence.ts"

test("six chapters cover distinct questions and all eight shortlisted profiles", () => {
  assert.equal(stages.length, 6)
  assert.equal(facilitators.length, 8)
  const questions = stages.flatMap((stage) => stage.groups.flat())
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length)
  for (const question of questions) {
    assert.ok(question.label)
    if (question.type !== "text") assert.ok(question.options?.length)
  }
  for (const pillar of pillars) {
    assert.ok(questions.some((question) => question.id === `${pillar.name.toLowerCase()}_priorities`))
  }
})

test("anonymous submissions allowlist answers and never attach identity or technical metadata", () => {
  const payload = feedbackPayload({
    previous_experience_standout: "The connections.",
    full_name: "Must not be sent",
    email: "not-sent@example.test",
    ip_address: "Must not be sent",
    unknown: "Must not be sent",
  }, "anonymous", "Must not be sent", "not-sent@example.test")
  assert.equal(payload.anonymity_preference, "anonymous")
  assert.equal(payload.previous_experience_standout, "The connections.")
  for (const key of ["full_name", "email", "ip_address", "unknown"]) assert.equal(key in payload, false)
  assert.ok(!Number.isNaN(Date.parse(payload.submitted_at)))
  assert.equal(payload.previous_attendee_confirmation, "Confirmed")
})

test("identified submissions trim identity and omit optional blank email", () => {
  const payload = feedbackPayload({}, "identified", "  Test Member  ", "  member@example.test  ")
  assert.equal(payload.full_name, "Test Member")
  assert.equal(payload.email, "member@example.test")
  assert.equal("email" in feedbackPayload({}, "identified", "Test Member", "  "), false)
})

test("multi-select arrays, separate pillar priorities, other responses and facilitator interests survive JSON encoding", () => {
  const answers = {
    positive_feedback_valuable_aspects: ["Networking and meaningful connections.", "Other."],
    positive_feedback_valuable_aspects_other: "Peer accountability",
    pillar_interests: ["Health", "Wealth"],
    health_priorities: "Sustainable performance",
    wealth_priorities: "Asset preservation",
    facilitator_interest_1: ["Particularly interested in their perspective.", "Would love to experience their session."],
  }
  const payload = JSON.parse(JSON.stringify(feedbackPayload(answers, "anonymous", "", "")))
  assert.deepEqual(payload.positive_feedback_valuable_aspects, answers.positive_feedback_valuable_aspects)
  assert.equal(payload.positive_feedback_valuable_aspects_other, "Peer accountability")
  assert.equal(payload.health_priorities, "Sustainable performance")
  assert.equal(payload.wealth_priorities, "Asset preservation")
  assert.deepEqual(payload.facilitator_interest_1_uke_enun, answers.facilitator_interest_1)
})

test("inactive conditional and other answers are omitted without mutating the draft", () => {
  const answers = {
    transportation_logistical_difficulties: "No.",
    transportation_logistical_details: "Old response",
    transportation_minor_details: "Old minor response",
    pillar_interests: ["Purpose"],
    health_priorities: "Old health response",
    purpose_priorities: "Direction",
    experience_expectations: ["Improved hospitality."],
    experience_expectations_other: "Old other response",
    additional_change: "   ",
    facilitator_interest_1: [],
  }
  const payload = feedbackPayload(answers, "anonymous", "", "")
  for (const key of ["transportation_logistical_details", "transportation_minor_details", "health_priorities", "experience_expectations_other", "additional_change", "facilitator_interest_1_uke_enun"]) {
    assert.equal(key in payload, false, key)
  }
  assert.equal(payload.purpose_priorities, "Direction")
  assert.equal(answers.health_priorities, "Old health response")
  assert.equal(isVisible({ when: { field: "pillar_interests", value: "Purpose" } }, answers), true)
})

test("draft restoration accepts only known fields and valid answer shapes", () => {
  const valid = { pillar_interests: ["Health"], pillar_priority: "", additional_change: "More reflection" }
  assert.deepEqual(parseDraft(JSON.stringify({ version: 1, answers: { ...valid, full_name: "Do not restore", email: "Do not restore" } })), valid)
  for (const raw of [
    "{",
    JSON.stringify({ version: 2, answers: {} }),
    JSON.stringify({ version: 1, answers: { pillar_interests: "Health" } }),
    JSON.stringify({ version: 1, answers: { pillar_priority: ["Health"] } }),
    JSON.stringify({ version: 1, answers: { pillar_interests: ["Invalid option"] } }),
    JSON.stringify({ version: 1, answers: { additional_change: "x".repeat(4001) } }),
  ]) assert.throws(() => parseDraft(raw))
})

test("progress restoration keeps valid position and sharing details and ignores invalid data", () => {
  const saved = { version: 1, answers: {}, progress: { mode: "identified", name: "Test Member", email: "m@example.test", stageIndex: 2, groupIndex: 1 } }
  assert.deepEqual(parseProgress(JSON.stringify(saved)), { mode: "identified", name: "Test Member", email: "m@example.test", stageIndex: 2, groupIndex: 1 })
  const fresh = { mode: null, name: "", email: "", stageIndex: 0, groupIndex: 0 }
  assert.deepEqual(parseProgress("{"), fresh)
  assert.deepEqual(parseProgress(JSON.stringify({ version: 1, answers: {} })), fresh)
  const outOfRange = parseProgress(JSON.stringify({ progress: { mode: "other", stageIndex: 99, groupIndex: 99 } }))
  assert.deepEqual(outOfRange, fresh)
  assert.equal(parseProgress(JSON.stringify({ progress: { stageIndex: 1, groupIndex: 99 } })).groupIndex, 0)
})
