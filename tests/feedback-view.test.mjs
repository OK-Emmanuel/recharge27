import assert from "node:assert/strict"
import test from "node:test"
import { buildFeedbackSections, countEntries } from "../lib/feedback-view.ts"
import { facilitators, stages } from "../lib/intelligence.ts"

const shape = [
  { title: "One", groups: [[{ id: "a", label: "Question A" }], [{ id: "b", label: "Question B" }]] },
  { title: "Two", groups: [[], [{ id: "c", label: "Question C" }]] },
  { title: "Three", groups: [[{ id: "facilitator_particular_interests", label: "Who?" }, { id: "d", label: "Question D" }]] },
]

test("answers follow the order of the questions, with Other text and facilitator interest placed where the form asked them", () => {
  const sections = buildFeedbackSections({
    d: "last", c: "see", b: ["x", "y"], a_other: "custom", a: ["first"],
    facilitator_interest_1_ada_l: ["Strong yes!"], facilitator_interest_2_bo: ["Open to them"],
  }, shape, [{ name: "Ada L" }, { name: "Bo" }])
  assert.deepEqual(sections.map((section) => section.title), ["One", "Two", "Three"])
  assert.deepEqual(sections[0].entries.map((entry) => entry.label), ["Question A", "Question A (Other)", "Question B"])
  assert.deepEqual(sections[0].entries[2].value, ["x", "y"])
  assert.deepEqual(sections[2].entries.map((entry) => entry.label), ["Interest in Ada L", "Interest in Bo", "Question D"])
  assert.equal(countEntries(sections), 7)
})

test("blank answers are dropped, odd values are shown as text, and unknown keys are kept in a final section", () => {
  const sections = buildFeedbackSections({ a: "  ", b: [], c: 5, mystery_key: "kept", empty_other: "" }, shape, [])
  assert.deepEqual(sections.map((section) => section.title), ["Two", "Other answers"])
  assert.deepEqual(sections[0].entries, [{ key: "c", label: "Question C", value: "5" }])
  assert.deepEqual(sections[1].entries, [{ key: "mystery_key", label: "mystery key", value: "kept" }])
  assert.deepEqual(buildFeedbackSections({}, shape, []), [])
})

test("facilitator interest gets its own section when no stage asks about facilitators", () => {
  const sections = buildFeedbackSections({ a: "x", facilitator_interest_1_ada_l: ["Strong yes!"] }, shape.slice(0, 2), [{ name: "Ada L" }])
  assert.deepEqual(sections.map((section) => section.title), ["One", "Facilitator interest"])
  assert.equal(sections[1].entries[0].label, "Interest in Ada L")
})

test("every real question and facilitator key stored by the feedback form maps to a labelled entry", () => {
  const answers = {}
  for (const question of stages.flatMap((stage) => stage.groups.flat())) answers[question.id] = "Answer"
  facilitators.forEach((facilitator, index) => {
    answers[`facilitator_interest_${index + 1}_${facilitator.name.replaceAll(" ", "_").toLowerCase()}`] = ["Strong yes!"]
  })
  const sections = buildFeedbackSections(answers, stages, facilitators)
  assert.equal(sections.some((section) => section.title === "Other answers"), false)
  assert.equal(countEntries(sections), Object.keys(answers).length)
  for (const facilitator of facilitators) {
    assert.ok(sections.flatMap((section) => section.entries).some((entry) => entry.label === `Interest in ${facilitator.name}`), facilitator.name)
  }
})
