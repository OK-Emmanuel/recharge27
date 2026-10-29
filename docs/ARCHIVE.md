# 2026 Archive Strategy

**Recommendation: hybrid. Keep `recharge26` as its own (frozen) deployment, and build a small curated archive section in `recharge27` that links to it.**

## What `recharge26` actually is

A full Next.js 16 application, not a static site:

- Paystack payment routes (`/api/payment/*`) and secrets in `.env` / `.env.local`
- NextAuth-protected participant and admin portal (`/portal`, `/admin`)
- File-based participant data in `data/` (registrations, attendance, feedback, hot seats, questions), plus `docs/data.md`, which contains participant emails
- Marketing pages, facilitators, updates, and a `public/` folder of about 15 MB of imagery
- Its own git history and Vercel project

## Why not copy it into `recharge27`

| Concern | Impact |
| --- | --- |
| Secrets and participant PII | Copying the repo would put payment keys, auth config and personal data into a new, public-facing codebase. |
| Dead functionality | Payments, registration, the portal and the admin area are 2026 mechanics. The 2027 model is invite-only by approval. |
| Duplication | Two copies of the same components, assets and data to maintain. |
| "Fresh and distinct" goal | Inheriting the 2026 app structure pulls its look and logic into 2027. |

## Why not link-only

A bare link makes 2026 content the product of an old marketing site. The valuable material (session summaries, updates, facilitators, takeaways) is buried in a sales-oriented page and in `docs/`.

## The plan

1. **Freeze `recharge26`.** Disable payments and registration (its feature flags in `data/feature-flags.json` already support this) and leave it deployed read-only. Link it from 2027 through `NEXT_PUBLIC_ARCHIVE_2026_URL`. The footer link on the Coming Soon page appears automatically once that variable is set.
2. **Curate, don't copy.** Add `content/archive/2026/` in `recharge27` with hand-selected Markdown only:
   - `docs/summary.md`: the business review session summary
   - `data/updates.json`: event updates
   - Facilitator bios and the core learning areas from the marketing components
   - Selected photos from `public/` (the January retreat group photo, the facilitators), resized
3. **Render at `/archive`.** A static, read-only route inside `recharge27` in the 2027 design system, once the full site is built.
4. **Never migrate** `.env*`, `data/*.json` (except `updates.json`), `docs/data.md`, `api/`, `portal/` or `admin/`.

## Content triage

| Source in `recharge26` | Action |
| --- | --- |
| `docs/summary.md` | Migrate (cleaned) |
| `data/updates.json` | Migrate (reviewed) |
| `app/facilitators/[slug]`, facilitator components | Migrate bios, not code |
| `app/about`, learning areas, takeaways | Distil into one archive overview |
| `public/` photos (retreat, facilitators) | Migrate selected, optimised |
| `docs/data.md`, `data/registrations.json`, `participants.json`, feedback, attendance | **Do not migrate** (PII) |
| `.env`, `.env.local`, `api/payment`, `api/auth` | **Do not migrate** (secrets and dead functionality) |
| `docs/*-SETUP.md`, `DEPLOYMENT.md` | Leave in `recharge26` (operational) |

## Housekeeping flagged during review

- Rotate the Paystack and `NEXTAUTH_SECRET` values in `recharge26/.env*` before anything is shared further. Treat them as exposed to anyone with access to the folder.
- `recharge26/next.config.mjs` sets `typescript.ignoreBuildErrors: true`. That is fine for a frozen archive but should not be carried over.
