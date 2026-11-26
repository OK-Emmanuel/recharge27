export const site = {
  name: "Wealth Lab",
  edition: "2027",
  theme: "Ratio Fortunae",
  themeMeaning: "The Logic of Wealth",
  tagline: "Where wealth builders think, build, and execute.",
  description:
    "Wealth Lab 2027 — Ratio Fortunae, the Logic of Wealth. A private two-day gathering for those who build with intention. Reserve your seat.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://wealthlab.example",
  formspreeFormId: "xqpploqd",
  // Set NEXT_PUBLIC_ARCHIVE_2026_URL to the 2026 deployment to surface the archive link.
  archive2026Url: process.env.NEXT_PUBLIC_ARCHIVE_2026_URL || null,
} as const
