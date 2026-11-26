"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

// Fades content in as it enters the viewport. Without JavaScript the content stays visible.
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: "div" | "li" | "article" | "section"
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === "undefined") {
      node.dataset.visible = "true"
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.dataset.visible = "true"
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag ref={ref as never} className={`reveal ${className}`} style={{ "--delay": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  )
}
