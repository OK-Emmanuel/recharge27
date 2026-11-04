import assert from "node:assert/strict"
import test from "node:test"
import {
  attendanceDays, toAnnouncementRow, toAttendanceRow, toFeedbackRow, toHotSeatRow, toParticipantRow, toQuestionRow, toUpdateRow,
} from "../lib/legacy-records.ts"

const everything = [toFeedbackRow, toAttendanceRow, toParticipantRow, toAnnouncementRow, toUpdateRow, toHotSeatRow, toQuestionRow]

test("every normaliser tolerates missing, null, and wrongly typed input without throwing", () => {
  for (const convert of everything) {
    for (const input of [undefined, null, "text", 42, [], {}, { id: {}, name: [], email: 7, timestamp: false }]) {
      assert.doesNotThrow(() => convert(input, 0), `${convert.name}(${JSON.stringify(input)})`)
    }
  }
})

test("rows without an ID get a stable fallback so table rows never collide", () => {
  assert.equal(toAttendanceRow({}, 4).id, "attendance-4")
  assert.equal(toParticipantRow({}, 2).id, "participant-2")
  assert.equal(toQuestionRow({ id: "Q-1" }, 9).id, "Q-1")
  assert.notEqual(toHotSeatRow({}, 0).id, toHotSeatRow({}, 1).id)
})

test("feedback keeps day-1 and final submissions, ignores other types, and drops the user ID", () => {
  const row = toFeedbackRow({
    id: "FB-1", userId: "secret-user-id", userName: " Ada ", email: "ada@example.test", type: "final", rating: "4",
    mostValuable: "Networking", decision: "Hire", unclear: "", testimonial: "Great", canUseTestimonial: true, timestamp: "2026-01-04T10:00:00.000Z",
  }, 0)
  assert.deepEqual([row.name, row.kind, row.rating, row.canUseTestimonial, row.testimonial], ["Ada", "final", 4, true, "Great"])
  assert.equal(JSON.stringify(row).includes("secret-user-id"), false)
  assert.equal(toFeedbackRow({ type: "day1", rating: "n/a", canUseTestimonial: "yes" }, 0).rating, null)
  assert.equal(toFeedbackRow({ type: "day1", canUseTestimonial: "yes" }, 0).canUseTestimonial, false)
  assert.equal(toFeedbackRow({ type: "survey" }, 0), null)
  assert.equal(toFeedbackRow({ type: "FINAL" }, 0), null)
})

test("attendance reads the day number, check-in time, and optional reflection", () => {
  const row = toAttendanceRow({ id: "ATT-1", userId: "u", name: "Bola", email: "bola@example.test", day: 2, reflection: null, timestamp: "2026-01-04T09:05:00.000Z" }, 0)
  assert.deepEqual([row.day, row.reflection, row.checkedInAt, row.name], [2, "", "2026-01-04T09:05:00.000Z", "Bola"])
  assert.equal(toAttendanceRow({ day: "1" }, 0).day, 1)
  assert.equal(toAttendanceRow({ day: "someday" }, 0).day, null)
  assert.equal(toAttendanceRow({ email: "only@example.test" }, 0).name, "only@example.test")
  assert.deepEqual(Object.keys(attendanceDays), ["1", "2"])
})

test("participants combine names, normalise status, and flag admins", () => {
  assert.deepEqual(toParticipantRow({ id: "1", firstName: " Ada", lastName: "Obi ", email: "a@example.test", status: "Confirmed", role: "admin" }, 0),
    { id: "1", name: "Ada Obi", email: "a@example.test", status: "confirmed", isAdmin: true })
  assert.equal(toParticipantRow({ firstName: "Solo", email: "s@example.test" }, 0).name, "Solo")
  assert.equal(toParticipantRow({ email: "s@example.test" }, 0).name, "s@example.test")
  assert.deepEqual([toParticipantRow({}, 0).name, toParticipantRow({}, 0).status, toParticipantRow({ role: "user" }, 0).isAdmin], ["Unnamed participant", "unknown", false])
})

test("announcements and updates normalise priority, status, and call-to-action buttons", () => {
  const announcement = toAnnouncementRow({ id: "ann_1", title: "Doors open", message: "At 9am", priority: "HIGH", timestamp: "2026-01-03T07:00:00.000Z", postedBy: "admin@example.test" }, 0)
  assert.deepEqual([announcement.priority, announcement.title, announcement.postedBy], ["high", "Doors open", "admin@example.test"])
  assert.equal(toAnnouncementRow({}, 0).title, "Untitled announcement")
  const update = toUpdateRow({
    id: "upd_1", slug: "retreat", title: "Retreat", status: "Past", eventDate: "2026-01-03T09:00:00.000Z", image: "/retreat.png",
    ctaButtons: [{ label: "Join", href: "/#pricing", variant: "default" }, { href: "https://example.test" }, {}, null, "junk"],
  }, 0)
  assert.equal(update.status, "past")
  assert.deepEqual(update.buttons, [{ label: "Join", href: "/#pricing" }, { label: "https://example.test", href: "https://example.test" }])
  assert.deepEqual(toUpdateRow({ ctaButtons: "nope" }, 0).buttons, [])
})

test("hot seats carry the selection state, and anonymous questions stay anonymous in the admin view", () => {
  const seat = toHotSeatRow({ id: "HS-1", userId: "u", userName: "Chidi", email: "c@example.test", challenge: "Scale", context: "B2B", helpWanted: "Pricing", selected: true, timestamp: "t1", updatedAt: "t2" }, 0)
  assert.deepEqual([seat.name, seat.selected, seat.submittedAt, seat.updatedAt], ["Chidi", true, "t1", "t2"])
  assert.equal(toHotSeatRow({ selected: "true" }, 0).selected, false)
  const anonymous = toQuestionRow({ id: "Q-1", userId: "u", userName: "Real Name", email: "real@example.test", isAnonymous: true, question: "Why?", category: "Money", answered: false, timestamp: "t" }, 0)
  assert.equal(anonymous.name, null)
  assert.equal(JSON.stringify(anonymous).includes("Real Name") || JSON.stringify(anonymous).includes("real@example.test"), false)
  const named = toQuestionRow({ userName: "Ngozi", question: "How?", answered: true, answeredAt: "t2", answeredBy: "admin@example.test" }, 1)
  assert.deepEqual([named.name, named.category, named.answered, named.answeredBy], ["Ngozi", "General", true, "admin@example.test"])
})
