"use client"

import { useEffect } from "react"
import Link from "next/link"
import confetti from "canvas-confetti"
import { CheckmarkCircle02Icon, Mail01Icon, SquareLock02Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function ThankYouPage() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const end = Date.now() + 2500
    const timer = setInterval(() => {
      const left = end - Date.now()
      if (left <= 0) return clearInterval(timer)
      const particleCount = 40 * (left / 2500)
      confetti({ startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, particleCount, origin: { x: 0.1 + Math.random() * 0.2, y: Math.random() - 0.2 } })
      confetti({ startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, particleCount, origin: { x: 0.7 + Math.random() * 0.2, y: Math.random() - 0.2 } })
    }, 250)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="atmosphere relative isolate overflow-hidden">
        <section className="relative z-10 mx-auto max-w-2xl px-6 py-24 text-center sm:py-32">
          <Icon icon={CheckmarkCircle02Icon} size={56} strokeWidth={1.25} className="mx-auto text-accent-bright" />
          <h1 className="section-title mt-8 text-5xl text-ivory sm:text-6xl">
            Your seat is <em>reserved.</em>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-mist">
            Thank you. Your payment is being confirmed by Paystack, and we will email your receipt shortly.
          </p>

          <ul className="card-surface mt-10 space-y-6 rounded-2xl p-8 text-left">
            <li className="flex gap-4">
              <Icon icon={Mail01Icon} size={24} className="mt-0.5 shrink-0 text-gold-deep" />
              <p className="text-mist">
                <span className="block font-serif text-xl text-ivory">Check your inbox</span>
                Your confirmation and next steps will be sent to the email you registered with.
              </p>
            </li>
            <li className="flex gap-4">
              <Icon icon={SquareLock02Icon} size={24} className="mt-0.5 shrink-0 text-gold-deep" />
              <p className="text-mist">
                <span className="block font-serif text-xl text-ivory">The venue is for confirmed participants</span>
                Once you are confirmed, we will share the venue privately. If you need help with discounted accommodation, simply reply to that email.
              </p>
            </li>
          </ul>

          <Link href="/" className="btn-ghost mt-10">
            Back to Wealth Lab
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
