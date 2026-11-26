import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import { site } from "@/lib/site"
import "./globals.css"

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
})

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const title = `${site.name} ${site.edition} — ${site.theme}`

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description: site.description,
  openGraph: {
    title,
    description: site.description,
    siteName: `${site.name} ${site.edition}`,
    type: "website",
  },
  twitter: { card: "summary", title, description: site.description },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d1e" },
  ],
  colorScheme: "light dark",
}

// Runs before first paint so a saved theme choice never flashes the wrong palette.
const themeScript = `(function(){try{var d=document.documentElement;d.classList.add("js");var t=localStorage.getItem("wl-theme");if(t==="light"||t==="dark")d.dataset.theme=t}catch(e){}})()`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
