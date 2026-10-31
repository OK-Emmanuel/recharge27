# Wealth Lab 2027

Next.js 16 (App Router), React 19, Tailwind CSS 4. Ships the invitation-only **Coming Soon** homepage and the private **Your Voice** community feedback experience at `/your-voice`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Structure

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Landing route. Renders `ComingSoon`; swap for the full homepage at launch. |
| `components/coming-soon.tsx` | The Coming Soon page. |
| `components/notify-form.tsx` | Email form using `@formspree/react` (form `xqpploqd`). Client validation, honeypot, success and error states. |
| `lib/site.ts` | Brand name, copy, Formspree ID, archive URL. |
| `app/globals.css` | Original indigo/orchid branding, subtle secondary gold, and motion. |
| `app/your-voice/page.tsx` | Private six-stage feedback route; excluded from search indexing, not access-controlled. |
| `app/your-voice/voice.css` | Responsive, gradient-free feedback styling using existing brand tokens. |
| `components/intelligence-form.tsx` | Guided questions, sharing preference, optional draft saving, validation, and submission states. |
| `lib/intelligence.ts` | Question structure, shortlisted profiles, draft validation, and analysis-friendly submission fields. |
| `docs/ARCHIVE.md` | How the 2026 archive is preserved. |

## Configuration

Copy `.env.example` to `.env.local`.

- `NEXT_PUBLIC_SITE_URL` — canonical URL, used for social metadata.
- `NEXT_PUBLIC_ARCHIVE_2026_URL` — when set, a "The 2026 Archive" link appears in the footer.
- `DATABASE_URL` — Neon Postgres connection string used by `/api/feedback` (required for feedback submissions).
- `LEGACY_DATABASE_URL` — optional separate connection string for the 2026 `kv_store`. Defaults to `DATABASE_URL`.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — the new dashboard's admin credentials. Password must be at least 12 characters. There is no passwordless login or default password.
- `AUTH_SECRET` — required session signing secret. Generate a unique secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

Set credentials locally in the ignored `.env.local` and separately in the hosting environment. Never put them in public variables or commit them.

## Admin dashboard

Open `/admin` on the new domain; sign in at `/admin/login`. The dashboard is copied from recharge26, including participants, attendance, lab submissions, questions, hot-seat selections, announcements, updates, feature flags, and exports. Every dashboard route is session-protected; data APIs require an authenticated admin.

- **2027 Feedback** at `/admin/portal/community-feedback` reads `feedback_responses`, displays 50 submissions per page, and offers a JSON export preserving arrays and separate answer fields. Anonymous submissions do not display identity fields.
- **2026 archive modules** use the existing `kv_store` keys. No records are copied or silently replaced with local files. Edits to announcements, updates, questions, hot-seat selections, or feature flags affect the shared 2026 records and therefore the old deployment too. Feature flags here control 2026 modules, not the new public feedback exercise.
- The original resource list contains placeholder downloads. These are shown as unavailable until actual files are supplied.
- Database failures show an error rather than an empty-data success. The old recharge26 app is unchanged.

## Evolving into the full site

Add routes beside `app/page.tsx` (e.g. `app/archive`, `app/about`) and shared layout pieces under `components/`. Keep the Coming Soon page in place until launch, then replace the contents of `app/page.tsx`. Reuse the tokens in `globals.css` rather than introducing new colours.

## Community feedback

Share `/your-voice` only with previous attendees. The page is deliberately not linked from the public homepage; `noindex` is not authentication.

- All feedback questions are optional. Sharing preference, a name for identified contributions, and previous-attendee confirmation are required. Email is optional.
- Six chapters are divided into short question groups. Back navigation preserves responses. Conditional answers are omitted from submissions when their parent selection no longer applies.
- Submission uses a JSON POST to the same-origin `/api/feedback` route (`app/api/feedback/route.ts`), which validates the body with `sanitizeFeedback` (unknown fields dropped, answers checked against the question options) and inserts a row into the Neon Postgres `feedback_responses` table (created on first use; `answers` is JSONB, name and email are columns). Success requires an HTTP success and `{ ok: true }`. Failures retain answers for retry; a synchronous lock prevents duplicate clicks.
- Anonymous submissions omit name and email entirely. Switching to anonymous clears identity inputs. The page adds no analytics, but discloses that hosting infrastructure may retain IP addresses or technical logs.
- Draft saving is explicitly opt-in via **Save draft**. It stores responses (never name or email) in this browser's local storage, not on a server. Returning users can restore or delete the draft; sharing preference and identity must be entered again. Drafts are removed after successful submission. Avoid saving on shared devices.
- Facilitators are shortlisted, not confirmed. Profile information is limited to the supplied brief. No ticket prices, event dates, or additional biographies are invented.
- Before deployment, set `DATABASE_URL` in the hosting environment and restrict access to the database. Do not advertise complete technical anonymity.

Validate with `npm test` (Node 22.18+ for native TypeScript loading), `npm run typecheck`, and `npm run build`. The focused tests cover question structure, anonymous payloads, multi-select encoding, conditional filtering, and draft validation. For browser submission checks, intercept `/api/feedback` and test success, rejection, timeout, and anonymous payloads without sending artificial community responses to the live endpoint.
