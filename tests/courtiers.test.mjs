import assert from "node:assert/strict"
import test from "node:test"
import { courtierQuestions, courtierSkills, validateCourtier, validateCourtierReview } from "../lib/courtiers.ts"

const application = () => ({
  submissionId: "12345678-1234-4234-8234-123456789012",
  fullName: "  Test Applicant  ",
  email: " applicant@example.test ",
  portfolio: "https://example.test/work",
  skills: [courtierSkills[0]],
  answers: Object.fromEntries(courtierQuestions.map((question) => [question.id, " Relevant evidence "])),
  commitment: true,
})

test("Courtier applications preserve skill selections and allowlist all evaluation answers", () => {
  const result = validateCourtier({ ...application(), status: "accepted", review_notes: "Untrusted", answers: { ...application().answers, injected: "Ignored" } })
  assert.equal(result.error, undefined)
  assert.equal(result.application.fullName, "Test Applicant")
  assert.equal(result.application.email, "applicant@example.test")
  assert.deepEqual(result.application.skills, [courtierSkills[0]])
  assert.deepEqual(Object.keys(result.application.answers), courtierQuestions.map((question) => question.id))
  assert.equal("status" in result.application, false)
  assert.equal("review_notes" in result.application, false)
})

test("Courtier validation rejects missing, malformed, and oversized fields", () => {
  for (const change of [
    { submissionId: "bad" }, { fullName: " " }, { fullName: "x".repeat(201) },
    { email: "invalid" }, { email: "x".repeat(255) },
    { skills: [] }, { skills: ["Invented"] }, { skills: [courtierSkills[0], courtierSkills[0]] },
    { skills: courtierSkills[0] }, { answers: null }, { commitment: false }, { commitment: "true" },
    { portfolio: "javascript:alert(1)" }, { portfolio: "ftp://example.test" },
    { portfolio: "https://user:password@example.test" }, { portfolio: "not a URL" },
  ]) assert.ok(validateCourtier({ ...application(), ...change }).error, JSON.stringify(change))
  for (const question of courtierQuestions) {
    for (const value of ["", " ", 123, "x".repeat(question.max + 1)]) {
      assert.ok(validateCourtier({ ...application(), answers: { ...application().answers, [question.id]: value } }).error)
    }
    assert.equal(validateCourtier({ ...application(), answers: { ...application().answers, [question.id]: "x".repeat(question.max) } }).error, undefined)
  }
  assert.equal(validateCourtier({ ...application(), portfolio: "" }).error, undefined)
})

test("manual reviews accept only explicit statuses, bounded notes, and valid concurrency versions", () => {
  for (const status of ["pending", "accepted", "declined"]) {
    assert.deepEqual(validateCourtierReview({ status, notes: "  Private notes  ", version: 0 }).review, { status, notes: "Private notes", version: 0 })
  }
  for (const input of [
    null, { status: "shortlisted", notes: "", version: 0 },
    { status: "accepted", notes: 42, version: 0 },
    { status: "accepted", notes: "x".repeat(5001), version: 0 },
    { status: "accepted", notes: "", version: -1 },
    { status: "accepted", notes: "", version: 0.5 },
    { status: "accepted", notes: "", version: "0" },
  ]) assert.ok(validateCourtierReview(input).error)
  assert.ok(validateCourtierReview({ status: "pending", notes: "x".repeat(5000), version: 2 }).review)
})
