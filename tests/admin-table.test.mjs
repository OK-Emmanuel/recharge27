import assert from "node:assert/strict"
import test from "node:test"
import { filterByQuery, pageForIndex, paginate, sortRows } from "../lib/admin-table.ts"
import { EMPTY_VALUE, formatDate, formatDateTime, formatTime, humanize, initials, parseTimestamp, plural, safeHref } from "../lib/format.ts"

const people = [
  { name: "Zainab Bello", email: "zainab@example.test", score: 8 },
  { name: "adam Eze", email: "adam@example.test", score: 10 },
  { name: "Chidi Obi", email: "chidi@example.test", score: null },
  { name: "Bola Ade", email: "bola@example.test", score: 2 },
]

test("search matches every term in any order, ignores case, and returns all rows for a blank query", () => {
  const text = (person) => `${person.name} ${person.email}`
  assert.deepEqual(filterByQuery(people, "  ", text), people)
  assert.deepEqual(filterByQuery(people, "EXAMPLE.test bola", text).map((person) => person.name), ["Bola Ade"])
  assert.deepEqual(filterByQuery(people, "ade eze", text), [])
  assert.deepEqual(filterByQuery(people, "AD", text).map((person) => person.name), ["adam Eze", "Bola Ade"])
  assert.notEqual(filterByQuery(people, "", text), people)
})

test("sorting is case-insensitive, numeric-aware, stable, and keeps empty values last in both directions", () => {
  const names = (rows) => rows.map((person) => person.name)
  assert.deepEqual(names(sortRows(people, (person) => person.name, "asc")), ["adam Eze", "Bola Ade", "Chidi Obi", "Zainab Bello"])
  assert.deepEqual(names(sortRows(people, (person) => person.name, "desc")), ["Zainab Bello", "Chidi Obi", "Bola Ade", "adam Eze"])
  assert.deepEqual(names(sortRows(people, (person) => person.score, "asc")), ["Bola Ade", "Zainab Bello", "adam Eze", "Chidi Obi"])
  assert.deepEqual(names(sortRows(people, (person) => person.score, "desc")), ["adam Eze", "Zainab Bello", "Bola Ade", "Chidi Obi"])
  assert.deepEqual(sortRows(["item 10", "item 9", "Item 1"], (value) => value, "asc"), ["Item 1", "item 9", "item 10"])
  const ties = [{ id: 1, group: "a" }, { id: 2, group: "a" }, { id: 3, group: "a" }]
  assert.deepEqual(sortRows(ties, (row) => row.group, "desc").map((row) => row.id), [1, 2, 3])
  assert.equal(people[0].name, "Zainab Bello", "the input array is not reordered")
})

test("pagination clamps out-of-range pages and treats a missing page size as one page", () => {
  const rows = Array.from({ length: 53 }, (_, index) => index)
  const second = paginate(rows, 1, 25)
  assert.equal(second.rows.length, 25)
  assert.equal(second.start, 25)
  assert.equal(second.pageCount, 3)
  const last = paginate(rows, 99, 25)
  assert.deepEqual([last.page, last.rows.length, last.start], [2, 3, 50])
  assert.equal(paginate(rows, -4, 25).page, 0)
  assert.equal(paginate(rows, Number.NaN, 25).page, 0)
  assert.deepEqual(paginate(rows, 3).rows, rows)
  assert.equal(paginate(rows, 3, 0).pageCount, 1)
  assert.deepEqual(paginate([], 2, 25), { rows: [], page: 0, pageCount: 1, start: 0 })
  assert.deepEqual([0, 24, 25, 52].map((index) => pageForIndex(index, 25)), [0, 0, 1, 2])
  assert.equal(pageForIndex(40), 0)
  assert.equal(pageForIndex(40, 0), 0)
})

test("stored links are only followed when they are web, mail, or same-site addresses", () => {
  assert.equal(safeHref(" https://example.test/work "), "https://example.test/work")
  assert.equal(safeHref("HTTP://example.test"), "HTTP://example.test")
  assert.equal(safeHref("mailto:person@example.test"), "mailto:person@example.test")
  assert.equal(safeHref("/updates/january-retreat"), "/updates/january-retreat")
  assert.equal(safeHref("/#pricing"), "/#pricing")
  for (const value of ["javascript:alert(1)", " JavaScript:alert(1)", "data:text/html,<b>x</b>", "vbscript:x", "//evil.test", "/\\evil.test", "ftp://example.test", "example.test", "", "   ", null, undefined, 42, {}]) {
    assert.equal(safeHref(value), undefined, String(value))
  }
})

test("timestamps parse from Postgres text, ISO strings, numbers, and Dates, and reject anything else", () => {
  const expected = "2026-11-04T08:12:33.123Z"
  assert.equal(parseTimestamp("2026-11-04 08:12:33.123456+00")?.toISOString(), expected)
  assert.equal(parseTimestamp("2026-11-04T08:12:33.123Z")?.toISOString(), expected)
  assert.equal(parseTimestamp("2026-11-04 09:12:33.123+01")?.toISOString(), expected)
  assert.equal(parseTimestamp("2026-11-04 13:42:33.123+05:30")?.toISOString(), expected)
  assert.equal(parseTimestamp(Date.parse(expected))?.toISOString(), expected)
  assert.equal(parseTimestamp(new Date(expected))?.toISOString(), expected)
  assert.equal(parseTimestamp("2026-11-04")?.toISOString(), "2026-11-04T00:00:00.000Z")
  for (const value of [null, undefined, "", "  ", "not a date", {}, Number.NaN, new Date("x")]) assert.equal(parseTimestamp(value), null, String(value))
})

test("dates are formatted in UTC with a fixed locale and fall back to a dash when missing", () => {
  assert.equal(formatDate("2026-11-04 08:12:33.123456+00"), "4 Nov 2026")
  assert.equal(formatDateTime("2026-11-04 08:12:33.123456+00"), "4 Nov 2026, 08:12 UTC")
  assert.equal(formatTime("2026-11-04T23:59:00Z"), "23:59 UTC")
  assert.equal(formatDateTime("2026-01-03T23:30:00-02:00"), "4 Jan 2026, 01:30 UTC")
  for (const format of [formatDate, formatDateTime, formatTime]) {
    assert.equal(format(undefined), EMPTY_VALUE)
    assert.equal(format("garbage"), EMPTY_VALUE)
  }
})

test("initials, labels, and plurals handle unusual input", () => {
  assert.equal(initials("Ada Lovelace"), "AL")
  assert.equal(initials("  mary  jane  watson "), "MW")
  assert.equal(initials("Madonna"), "M")
  assert.equal(initials("   "), "?")
  assert.equal(initials("😀 Smile"), "😀S")
  assert.equal(humanize("few-times"), "Few times")
  assert.equal(humanize("clarity_q1"), "Clarity q1")
  assert.equal(humanize("__"), EMPTY_VALUE)
  assert.equal(plural(1, "answer"), "1 answer")
  assert.equal(plural(0, "answer"), "0 answers")
  assert.equal(plural(2, "reply", "replies"), "2 replies")
})
