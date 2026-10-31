import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readData } from "@/lib/data-store"

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const feedbackFile = join(process.cwd(), "data", "feedback.json")
    const feedback = await readData("commitments")

    // Convert to CSV
    const headers = ["ID", "User Name", "Email", "Type", "Most Valuable", "Decision", "Unclear", "Rating", "Testimonial", "Can Use Testimonial", "Timestamp"]
    const rows = feedback.map((fb: any) => [
      fb.id,
      fb.userName,
      fb.email,
      fb.type,
      `"${fb.mostValuable.replace(/"/g, '""')}"`,
      `"${fb.decision.replace(/"/g, '""')}"`,
      `"${fb.unclear.replace(/"/g, '""')}"`,
      fb.rating,
      fb.testimonial ? `"${fb.testimonial.replace(/"/g, '""')}"` : "",
      fb.canUseTestimonial ? "Yes" : "No",
      fb.timestamp,
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row: any[]) => row.join(",")),
    ].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="feedback_${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
