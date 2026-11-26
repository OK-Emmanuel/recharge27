import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })

    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature") ?? ""
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex")

    const valid =
      hash.length === signature.length && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
    if (!valid) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    if (event.event === "charge.success") {
      console.log("PAYMENT SUCCESSFUL:", {
        reference: event.data.reference,
        status: event.data.status === "success" ? "successful" : "failed",
        tierName: event.data.metadata?.tierName,
        amount: event.data.amount / 100, // from kobo
        paidAt: event.data.paid_at,
      })
    }

    return NextResponse.json({ message: "Webhook processed" })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
