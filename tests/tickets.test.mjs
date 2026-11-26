import assert from "node:assert/strict"
import test from "node:test"
import { checkPayment, formatNgn, minInstalment, ngn, tickets } from "../lib/tickets.ts"

test("naira prices follow $1 = ₦1,000", () => {
  assert.deepEqual(
    tickets.map((ticket) => [ticket.name, ticket.usd, ngn(ticket)]),
    [
      ["Standard", 100, 100000],
      ["Couples", 150, 150000],
      ["VIP", 200, 200000],
      ["Team", 500, 500000],
    ],
  )
  assert.equal(formatNgn(150000), "₦150,000")
})

test("couples and VIP include accommodation; standard and team get assistance", () => {
  const policy = Object.fromEntries(tickets.map((ticket) => [ticket.id, ticket.accommodation]))
  assert.deepEqual(policy, { standard: "assisted", couples: "included", vip: "included", team: "assisted" })
})

test("payments must match the server-side catalogue", () => {
  assert.equal(checkPayment({ tierName: "VIP", amount: 200000 }).ok, true)
  assert.equal(checkPayment({ tierName: "VIP", amount: 1 }).ok, false)
  assert.equal(checkPayment({ tierName: "Gold", amount: 200000 }).ok, false)
  assert.equal(checkPayment({ tierName: "VIP", amount: "abc" }).ok, false)
})

test("instalments need at least 50% and at most the full price", () => {
  const standard = tickets[0]
  assert.equal(minInstalment(standard), 50000)
  assert.equal(checkPayment({ tierName: "Standard", amount: 50000, isFlexiblePayment: true }).ok, true)
  assert.equal(checkPayment({ tierName: "Standard", amount: 49999, isFlexiblePayment: true }).ok, false)
  assert.equal(checkPayment({ tierName: "Standard", amount: 100001, isFlexiblePayment: true }).ok, false)
})
