import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getFeatureFlags, updateFeatureFlags, type FeatureFlags } from "@/lib/feature-flags"

export async function GET() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const flags = await getFeatureFlags()
  return NextResponse.json({ flags })
}

export async function PATCH(request: Request) {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = (await request.json()) as Partial<FeatureFlags>
    const flags = await updateFeatureFlags(payload)
    return NextResponse.json({ success: true, flags })
  } catch (error) {
    console.error("Failed to update feature flags:", error)
    return NextResponse.json({ error: "Failed to update feature flags" }, { status: 500 })
  }
}
