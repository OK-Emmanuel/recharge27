"use client"

import { useState } from "react"
import { InformationCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icon } from "@/components/icon"
import { formatNgn, formatUsd, minInstalment, ngn, type Ticket } from "@/lib/tickets"

type Mode = "full" | "instalment"

const emptyForm = { firstName: "", lastName: "", email: "", phone: "", partialAmount: "" }

// Both flows post to /api/payment/initialize, which redirects to Paystack.
export function CheckoutDialog({
  ticket,
  open,
  onOpenChange,
}: {
  ticket: Ticket
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [mode, setMode] = useState<Mode>("full")
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fullPrice = ngn(ticket)
  const minAmount = minInstalment(ticket)
  const partial = Number.parseInt(form.partialAmount, 10) || 0
  const partialValid = partial >= minAmount && partial <= fullPrice
  const amount = mode === "full" ? fullPrice : partial
  const field = (key: keyof typeof emptyForm) => ({
    value: form[key],
    disabled: loading,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value }),
  })

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    if (mode === "instalment" && !partialValid) {
      setError(`Enter an amount between ${formatNgn(minAmount)} and ${formatNgn(fullPrice)}.`)
      return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          amount,
          tierName: ticket.name,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || undefined,
          ...(mode === "instalment" ? { isFlexiblePayment: true, fullPrice, partialAmount: partial } : {}),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "We could not start your payment.")
      window.location.href = data.authorization_url
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not start your payment.")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <DialogContent>
        <p className="eyebrow mb-3">Reserve your seat</p>
        <DialogTitle>{ticket.name} ticket</DialogTitle>
        <DialogDescription>
          {ticket.summary} {formatNgn(fullPrice)} / {formatUsd(ticket.usd)}.
        </DialogDescription>

        <div role="group" aria-label="Payment option" className="mt-6 grid grid-cols-2 rounded-full border border-line p-1 text-[0.7rem] tracking-[0.14em] uppercase">
          {(["full", "instalment"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`cursor-pointer rounded-full px-3 py-2.5 transition-colors ${mode === value ? "bg-gold text-[#2a2208]" : "text-mist hover:text-ivory"}`}
            >
              {value === "full" ? "Pay in full" : "Pay in instalments"}
            </button>
          ))}
        </div>

        {mode === "instalment" && (
          <div className="mt-4 flex gap-3 rounded-lg border border-line bg-ink-soft p-4 text-sm text-mist">
            <Icon icon={InformationCircleIcon} size={20} className="mt-0.5 shrink-0 text-accent-bright" />
            <p>
              Commit from {formatNgn(minAmount)} (50% minimum) to secure your seat. The balance is due before the event begins.
            </p>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" autoComplete="given-name" required {...field("firstName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" autoComplete="family-name" required {...field("lastName")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required {...field("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number{mode === "full" ? " (optional)" : ""}</Label>
            <Input id="phone" type="tel" autoComplete="tel" placeholder="08012345678" required={mode === "instalment"} {...field("phone")} />
          </div>
          {mode === "instalment" && (
            <div className="space-y-2">
              <Label htmlFor="partialAmount">Commitment amount (₦)</Label>
              <Input
                id="partialAmount"
                type="number"
                inputMode="numeric"
                min={minAmount}
                max={fullPrice}
                step={1}
                placeholder={`Minimum ${minAmount.toLocaleString("en-NG")}`}
                required
                {...field("partialAmount")}
              />
              {partial > 0 && partial < fullPrice && (
                <p className="text-xs text-accent-bright">Balance after this payment: {formatNgn(fullPrice - partial)}</p>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading || (mode === "instalment" && !partialValid)} className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? (
              <>
                <Icon icon={Loading03Icon} size={18} className="animate-spin" /> Processing
              </>
            ) : (
              `Pay ${formatNgn(amount)}`
            )}
          </button>
          <p className="text-center text-xs leading-relaxed text-mist/80">
            Secure payment by Paystack. Venue details are sent to confirmed participants only.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
