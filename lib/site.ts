export const site = {
  name: "Wealth Lab",
  edition: "2027",
  tagline: "By invitation only.",
  description:
    "Wealth Lab returns in 2027. A private, invitation-only gathering for those who build with intention. Request to be invited.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://wealthlab.example",
  formspreeFormId: "xqpploqd",
  // Set NEXT_PUBLIC_ARCHIVE_2026_URL to the 2026 deployment to surface the archive link.
  archive2026Url: process.env.NEXT_PUBLIC_ARCHIVE_2026_URL || null,
} as const
