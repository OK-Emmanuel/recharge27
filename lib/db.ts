import { neon } from "@neondatabase/serverless"
import type { FeedbackSubmission } from "./intelligence"

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
