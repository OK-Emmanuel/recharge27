import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readData } from "@/lib/data-store"

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const audits = await readData("audits")

    // Create dynamic CSV based on audit type
    const csvData: string[] = []
    
    // Health assessments
    const healthAudits = audits.filter((a: any) => a.type === "health")
    if (healthAudits.length > 0) {
      csvData.push("\n=== HEALTH ASSESSMENTS ===")
      const healthHeaders = ["User ID", "Email", "Name", "Sleep", "Energy", "Stress", "Focus", "Exercise", "Nutrition", "Red Flags", "90-Day Intentions", "Timestamp"]
      csvData.push(healthHeaders.join(","))
      
      healthAudits.forEach((audit: any) => {
        const row = [
          audit.userId,
          audit.email,
          audit.name,
          audit.answers?.sleep || "",
          audit.answers?.energy || "",
          audit.answers?.stress || "",
          audit.answers?.focus || "",
          audit.answers?.exercise || "",
          audit.answers?.nutrition || "",
          audit.answers?.redFlags ? `"${audit.answers.redFlags.replace(/"/g, '""')}"` : "",
          audit.answers?.intentions ? `"${audit.answers.intentions.replace(/"/g, '""')}"` : "",
          audit.timestamp,
        ]
        csvData.push(row.join(","))
      })
    }

    // Brand audits
    const brandAudits = audits.filter((a: any) => a.type === "brand")
    if (brandAudits.length > 0) {
      csvData.push("\n\n=== BRAND AUDITS ===")
      const brandHeaders = ["User ID", "Email", "Name", "Decision Lock", "Responses", "Timestamp"]
      csvData.push(brandHeaders.join(","))
      
      brandAudits.forEach((audit: any) => {
        const row = [
          audit.userId,
          audit.email,
          audit.name,
          audit.decisionLock ? `"${audit.decisionLock.replace(/"/g, '""')}"` : "",
          audit.responses ? `"${JSON.stringify(audit.responses).replace(/"/g, '""')}"` : "",
          audit.timestamp,
        ]
        csvData.push(row.join(","))
      })
    }

    // Offer audits
    const offerAudits = audits.filter((a: any) => a.type === "offer")
    if (offerAudits.length > 0) {
      csvData.push("\n\n=== OFFER DEFINITIONS ===")
      const offerHeaders = ["User ID", "Email", "Name", "Offer Statement", "Decision", "Execution Plan", "Measurement Plan", "Responses", "Timestamp"]
      csvData.push(offerHeaders.join(","))
      
      offerAudits.forEach((audit: any) => {
        const row = [
          audit.userId,
          audit.email,
          audit.name,
          audit.offerStatement ? `"${audit.offerStatement.replace(/"/g, '""')}"` : "",
          audit.decision ? `"${audit.decision.replace(/"/g, '""')}"` : "",
          audit.executionPlan ? `"${audit.executionPlan.replace(/"/g, '""')}"` : "",
          audit.measurementPlan ? `"${audit.measurementPlan.replace(/"/g, '""')}"` : "",
          audit.responses ? `"${JSON.stringify(audit.responses).replace(/"/g, '""')}"` : "",
          audit.timestamp,
        ]
        csvData.push(row.join(","))
      })
    }

    const csv = csvData.join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="lab_audits_${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
