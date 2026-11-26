import { NextRequest, NextResponse } from "next/server"
import { sendRegistrationNotification } from "@/lib/notifications"
import { checkPayment, ngn } from "@/lib/tickets"
import { site } from "@/lib/site"

const text = (value: unknown, max = 120) => (typeof value === "string" ? value.trim().slice(0, max) : "")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = text(body.email, 254)
    const firstName = text(body.firstName)
    const lastName = text(body.lastName)
    const phone = text(body.phone, 30)
    const isFlexiblePayment = body.isFlexiblePayment === true

    if (!email || !firstName || !lastName || !body.amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Prices come from the server-side catalogue; the browser's amount is only validated against it.
    const check = checkPayment({ tierName: body.tierName, amount: body.amount, isFlexiblePayment })
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 })
    const { ticket } = check
    const amount = Number(body.amount)
    const fullPrice = ngn(ticket)

    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY is not configured")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    const customFields: { display_name: string; variable_name: string; value: string }[] = [
      { display_name: "Tier", variable_name: "tier", value: ticket.name },
    ]
    const metadata: Record<string, unknown> = {
      tierName: ticket.name,
      firstName,
      lastName,
      phone: phone || "Not provided",
      custom_fields: customFields,
    }

    if (isFlexiblePayment) {
      Object.assign(metadata, {
        isFlexiblePayment: true,
        fullPrice,
        partialAmount: amount,
        balanceDue: fullPrice - amount,
        paymentType: "Partial Payment",
      })
      customFields.push(
        { display_name: "Payment Type", variable_name: "payment_type", value: "Flexible/Partial Payment" },
        { display_name: "Full Price", variable_name: "full_price", value: `₦${fullPrice.toLocaleString("en-NG")}` },
        { display_name: "Balance Due", variable_name: "balance_due", value: `₦${(fullPrice - amount).toLocaleString("en-NG")}` },
      )
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // kobo
        currency: "NGN",
        callback_url: `${site.url}/thank-you`,
        metadata,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error("Paystack error:", data)
      return NextResponse.json({ error: data.message || "Payment initialization failed" }, { status: response.status })
    }

    try {
      await sendRegistrationNotification({
        firstName,
        lastName,
        email,
        phone: phone || "Not provided",
        tierName: ticket.name,
        price: amount,
        reference: data.data.reference,
        status: "pending",
        isFlexiblePayment,
        fullPrice,
        balanceDue: fullPrice - amount,
      })
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError)
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
