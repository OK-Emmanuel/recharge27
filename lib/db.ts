import { neon } from "@neondatabase/serverless"
import type { FeedbackSubmission } from "./intelligence"
import type { Answers } from "./intelligence"

let tableReady: Promise<void> | null = null

function client() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return neon(url)
}

async function ensureTable(sql: ReturnType<typeof client>) {
  tableReady ??= sql`
    CREATE TABLE IF NOT EXISTS feedback_responses (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      anonymity TEXT NOT NULL,
      full_name TEXT,
      email TEXT,
      answers JSONB NOT NULL
    )
  `.then(() => undefined)
  try {
    await tableReady
  } catch (error) {
    tableReady = null
    throw error
  }
}

export async function saveFeedback(submission: FeedbackSubmission) {
  const sql = client()
  await ensureTable(sql)
  await sql`
    INSERT INTO feedback_responses (anonymity, full_name, email, answers)
    VALUES (${submission.mode}, ${submission.fullName}, ${submission.email}, ${JSON.stringify(submission.answers)}::jsonb)
  `
}

export type FeedbackResponse = {
  id: string
  created_at: string
  anonymity: "anonymous" | "identified"
  full_name: string | null
  email: string | null
  answers: Answers
}

export async function readFeedback(limit = 50, offset = 0): Promise<{ responses: FeedbackResponse[]; total: number }> {
  const sql = client()
  await ensureTable(sql)
  const [counts, rows] = await Promise.all([
    sql`SELECT count(*)::int AS total FROM feedback_responses`,
    sql`
      SELECT id::text, created_at::text, anonymity, full_name, email, answers
      FROM feedback_responses
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
  ])
  return { responses: rows as FeedbackResponse[], total: Number(counts[0].total) }
}

export async function exportFeedback(): Promise<FeedbackResponse[]> {
  const sql = client()
  await ensureTable(sql)
  const rows = await sql`
    SELECT id::text, created_at::text, anonymity, full_name, email, answers
    FROM feedback_responses ORDER BY created_at DESC, id DESC
  `
  return rows as FeedbackResponse[]
}
