# Wealth Lab 2027

Next.js 16 (App Router), React 19, Tailwind CSS 4. Currently ships the invitation-only **Coming Soon** page.

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
| `app/globals.css` | Design tokens (ink, ivory, champagne gold) and motion. |
| `docs/ARCHIVE.md` | How the 2026 archive is preserved. |

## Configuration (optional)

Copy `.env.example` to `.env.local`.

- `NEXT_PUBLIC_SITE_URL` — canonical URL, used for social metadata.
- `NEXT_PUBLIC_ARCHIVE_2026_URL` — when set, a "The 2026 Archive" link appears in the footer.

## Evolving into the full site

Add routes beside `app/page.tsx` (e.g. `app/archive`, `app/about`) and shared layout pieces under `components/`. Keep the Coming Soon page in place until launch, then replace the contents of `app/page.tsx`. Reuse the tokens in `globals.css` rather than introducing new colours.
