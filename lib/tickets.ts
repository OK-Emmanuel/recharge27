// Ticket catalogue. Prices are defined once in USD; naira is derived at ₦1,000 per $1.
export const NGN_PER_USD = 1000
// Flexible payments must commit at least this share of the full price up front.
export const MIN_INSTALMENT_SHARE = 0.5

export type AccommodationPolicy = "included" | "assisted"

export interface Ticket {
  id: string
  name: string
  usd: number
  audience: string
  summary: string
  benefits: string[]
  accommodation: AccommodationPolicy
  featured?: boolean
}

export const tickets: readonly Ticket[] = [
  {
    id: "standard",
    name: "Standard",
    usd: 100,
    audience: "For the individual builder",
    summary: "Two-day event attendance and food benefits.",
    benefits: ["Full two-day attendance", "Meals and refreshments across both days", "Venue details, shared once you are confirmed"],
    accommodation: "assisted",
  },
  {
    id: "couples",
    name: "Couples",
    usd: 150,
    audience: "For partners building together",
    summary: "Two-day attendance and food benefits for spouses.",
    benefits: [
      "Full two-day attendance for both spouses",
      "Meals and refreshments for both spouses",
      "Complimentary accommodation",
      "Venue details, shared once you are confirmed",
    ],
    accommodation: "included",
  },
  {
    id: "vip",
    name: "VIP",
    usd: 200,
    audience: "The complete experience",
    summary: "All event benefits, including accommodation.",
    benefits: [
      "Every benefit the event offers",
      "Full two-day attendance and meals",
      "Complimentary accommodation",
      "Venue details, shared once you are confirmed",
    ],
    accommodation: "included",
    featured: true,
  },
  {
    id: "team",
    name: "Team",
    usd: 500,
    audience: "For organisations and circles",
    summary: "Admission for a team of 8 people.",
    benefits: [
      "Full two-day attendance for 8 people",
      "Meals and refreshments for the whole team",
      "Venue details, shared once you are confirmed",
    ],
    accommodation: "assisted",
  },
]

export const ngn = (ticket: Pick<Ticket, "usd">) => ticket.usd * NGN_PER_USD

export const formatNgn = (amount: number) => `₦${amount.toLocaleString("en-NG")}`
export const formatUsd = (amount: number) => `$${amount.toLocaleString("en-US")}`

export function findTicket(name: unknown): Ticket | undefined {
  return tickets.find((ticket) => ticket.name === name)
}

export const minInstalment = (ticket: Pick<Ticket, "usd">) => Math.ceil(ngn(ticket) * MIN_INSTALMENT_SHARE)

export type PaymentCheck = { ok: true; ticket: Ticket } | { ok: false; error: string }

// The payment API trusts the server-side catalogue, never the amount sent by the browser.
export function checkPayment(input: { tierName: unknown; amount: unknown; isFlexiblePayment?: unknown }): PaymentCheck {
  const ticket = findTicket(input.tierName)
  if (!ticket) return { ok: false, error: "Unknown ticket" }
  const amount = Number(input.amount)
  if (!Number.isInteger(amount)) return { ok: false, error: "Invalid amount" }
  const full = ngn(ticket)
  if (input.isFlexiblePayment === true) {
    if (amount < minInstalment(ticket) || amount > full) return { ok: false, error: "Amount outside the allowed range" }
    return { ok: true, ticket }
  }
  if (amount !== full) return { ok: false, error: "Amount does not match the ticket price" }
  return { ok: true, ticket }
}
