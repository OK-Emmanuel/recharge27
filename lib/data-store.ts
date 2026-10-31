import { neon } from "@neondatabase/serverless"

function client() {
  const url = process.env.LEGACY_DATABASE_URL || process.env.DATABASE_URL
  if (!url) throw new Error("LEGACY_DATABASE_URL or DATABASE_URL is required to access 2026 records")
  return neon(url)
}

// Retains the heterogeneous record contract of the copied 2026 dashboard.
export async function readData<T = any>(key: string): Promise<T[]> {
  const sql = client()
  const rows = await sql`SELECT value FROM kv_store WHERE key = ${key} LIMIT 1`
  const value: unknown = rows[0]?.value
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) throw new Error(`Invalid 2026 records for ${key}`)
  return value
}

export async function writeData<T>(key: string, records: T[]): Promise<void> {
  const sql = client()
  await sql`
    INSERT INTO kv_store (key, value)
    VALUES (${key}, ${JSON.stringify(records)}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `
}
