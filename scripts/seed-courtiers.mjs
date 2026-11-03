import { readFile } from "node:fs/promises"
import nextEnv from "@next/env"
import { neon } from "@neondatabase/serverless"
import { courtierSkills } from "../lib/courtiers.ts"

nextEnv.loadEnvConfig(process.cwd())
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")
const sql = neon(process.env.DATABASE_URL)
const schema = await readFile(new URL("./courtiers-schema.sql", import.meta.url), "utf8")
await sql.transaction([
  ...schema.split(";").map((statement) => statement.trim()).filter(Boolean).map((statement) => sql.query(statement)),
  ...courtierSkills.map((skill, index) => sql`
    INSERT INTO courtier_skills (name, position) VALUES (${skill}, ${index})
    ON CONFLICT (name) DO UPDATE SET position = EXCLUDED.position
  `),
])
const [row] = await sql`SELECT count(*)::int AS total FROM courtier_skills`
console.log(`Courtier schema ready. ${row.total} skill categories seeded. No applications added.`)
