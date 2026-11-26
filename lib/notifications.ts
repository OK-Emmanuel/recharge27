export interface RegistrationNotice {
  firstName: string
  lastName: string
  email: string
  phone: string
  tierName: string
  price: number
  reference: string
  status: "pending" | "successful" | "failed"
  isFlexiblePayment: boolean
  fullPrice: number
  balanceDue: number
}

// Logs a new registration and forwards it to REGISTRATION_WEBHOOK_URL when configured.
export async function sendRegistrationNotification(registration: RegistrationNotice) {
  const payload = {
    name: `${registration.firstName} ${registration.lastName}`,
    email: registration.email,
    phone: registration.phone,
    tier: registration.tierName,
    price: registration.price,
    fullPrice: registration.fullPrice,
    balanceDue: registration.balanceDue,
    reference: registration.reference,
    status: registration.status,
    timestamp: new Date().toISOString(),
  }

  console.log("NEW REGISTRATION:", { tier: payload.tier, price: payload.price, reference: payload.reference })

  if (!process.env.REGISTRATION_WEBHOOK_URL) return
  try {
    await fetch(process.env.REGISTRATION_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error("Failed to send webhook notification:", error)
  }
}
