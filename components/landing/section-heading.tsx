import type { ReactNode } from "react"
import { Reveal } from "@/components/reveal"

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "left",
}: {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
  align?: "left" | "center"
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-5 text-4xl text-ivory sm:text-5xl lg:text-6xl">{title}</h2>
      {children && <p className="mt-6 text-base leading-relaxed text-pretty text-mist sm:text-lg">{children}</p>}
    </Reveal>
  )
}

export const container = "mx-auto w-full max-w-7xl px-6 sm:px-10"
