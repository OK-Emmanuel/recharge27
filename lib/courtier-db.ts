import { neon } from "@neondatabase/serverless"
import type { CourtierAnswers, CourtierApplication, ReviewStatus } from "./courtiers"

function client() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")
  return neon(process.env.DATABASE_URL)
}

export type CourtierResponse = {
  id: string
  created_at: string
  full_name: string
  email: string
  portfolio: string
  skills: string[]
  answers: CourtierAnswers
  status: ReviewStatus
  review_notes: string
  reviewed_at: string | null
  reviewed_by: string | null
  version: number
}

export async function readCourtierSkills(): Promise<string[]> {
  const rows = await client()`SELECT name FROM courtier_skills ORDER BY position`
  if (!rows.length) throw new Error("Courtier skills are not seeded. Run npm run seed:courtiers.")
  return rows.map((row) => String(row.name))
}

export async function saveCourtier(application: CourtierApplication): Promise<boolean> {
  const sql = client()
  // A retry with the same ID and answers is safe; it never resets an admin's decision.
  const rows = await sql`
    INSERT INTO courtier_applications (id, full_name, email, portfolio, skills, answers, commitment)
    VALUES (${application.submissionId}::uuid, ${application.fullName}, ${application.email}, ${application.portfolio},
      ${JSON.stringify(application.skills)}::jsonb, ${JSON.stringify(application.answers)}::jsonb, TRUE)
    ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id
      WHERE courtier_applications.full_name = EXCLUDED.full_name
        AND courtier_applications.email = EXCLUDED.email
        AND courtier_applications.portfolio = EXCLUDED.portfolio
        AND courtier_applications.skills = EXCLUDED.skills
        AND courtier_applications.answers = EXCLUDED.answers
    RETURNING id
  `
  return rows.length === 1
}

export async function readCourtiers(status: ReviewStatus | null, limit = 25, offset = 0):
  Promise<{ applications: CourtierResponse[]; total: number }> {
  const sql = client()
  const [counts, rows] = await Promise.all([
    sql`SELECT count(*)::int AS total FROM courtier_applications WHERE (${status}::text IS NULL OR status = ${status})`,
    sql`SELECT id::text, created_at::text, full_name, email, portfolio, skills, answers, status,
      review_notes, reviewed_at::text, reviewed_by, version FROM courtier_applications
      WHERE (${status}::text IS NULL OR status = ${status})
      ORDER BY created_at DESC, id DESC LIMIT ${limit} OFFSET ${offset}`,
  ])
  return { applications: rows as CourtierResponse[], total: Number(counts[0].total) }
}

export async function reviewCourtier(id: string, status: ReviewStatus, notes: string, version: number, reviewer: string) {
  const rows = await client()`
    UPDATE courtier_applications SET status = ${status}, review_notes = ${notes},
      reviewed_at = now(), reviewed_by = ${reviewer}, version = version + 1
    WHERE id = ${id}::uuid AND version = ${version} RETURNING version
  `
  return rows.length === 1
}
