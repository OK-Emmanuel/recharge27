"use client"

import { useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { courtierQuestions, validateCourtier, type CourtierAnswers } from "@/lib/courtiers"

const chapters = ["Your skills", "How you serve", "Your commitment"]

export function CourtierForm({ skills }: { skills: string[] }) {
  const [step, setStep] = useState(0)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [portfolio, setPortfolio] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [answers, setAnswers] = useState<CourtierAnswers>({ experience: "", motivation: "", grace: "", agency: "", availability: "" })
  const [commitment, setCommitment] = useState(false)
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const lock = useRef(false)
  const submissionId = useRef("")
  const heading = useRef<HTMLHeadingElement>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const initialRender = useRef(true)

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }
    heading.current?.focus()
  }, [step, success])
  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    if (step === 0 && selected.length === 0) {
      setError("Choose at least one skill you can contribute.")
      return
    }
    if (step < 2) {
      setStep(step + 1)
      return
    }
    if (lock.current) return
    submissionId.current ||= crypto.randomUUID()
    const result = validateCourtier({ submissionId: submissionId.current, fullName, email, portfolio, skills: selected, answers, commitment })
    if (!result.application) {
      setError(result.error)
      return
    }
    lock.current = true
    setSending(true)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20_000)
    try {
      const response = await fetch("/api/wealth-courtiers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(result.application),
        signal: controller.signal,
      })
      const body: unknown = await response.json()
      if (!response.ok || !body || typeof body !== "object" || !("ok" in body) || body.ok !== true) {
        const message = body && typeof body === "object" && "error" in body && typeof body.error === "string"
          ? body.error : "We couldn't confirm your application. Please try again."
        throw new Error(message)
      }
      setSuccess(true)
      setFullName("")
      setEmail("")
      setPortfolio("")
      setSelected([])
      setAnswers({ experience: "", motivation: "", grace: "", agency: "", availability: "" })
      setCommitment(false)
    } catch (failure) {
      setError(failure instanceof Error && failure.name === "AbortError"
        ? "We couldn't confirm your application in time. Your answers are still here; retry safely when your connection is ready."
        : failure instanceof Error ? failure.message : "We couldn't send your application. Please try again.")
    } finally {
      window.clearTimeout(timeout)
      lock.current = false
      setSending(false)
    }
  }

  if (success) return (
    <div className="courtier-form courtier-success" role="status">
      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={48} strokeWidth={1.5} aria-hidden="true" />
      <h3 ref={heading} tabIndex={-1}>Your application is in.</h3>
      <p>Thank you for choosing to contribute. The team will review your application manually and contact you by email if selected or if more information is needed.</p>
      <p className="courtier-small">This is not a confirmation of selection or admission.</p>
    </div>
  )

  const questions = courtierQuestions.filter((question) => step === 0 ? question.id === "experience"
    : step === 1 ? ["motivation", "grace", "agency"].includes(question.id) : question.id === "availability")

  return (
    <form className="courtier-form" onSubmit={submit}>
      <nav className="courtier-steps" aria-label="Application chapters">
        {chapters.map((chapter, index) => (
          <button key={chapter} type="button" disabled={sending || index > step}
            aria-current={index === step ? "step" : undefined}
            onClick={() => { setStep(index); setError("") }}>
            <span>{index + 1}</span>{chapter}
          </button>
        ))}
      </nav>
      <p className="courtier-small">Step {step + 1} of 3 &middot; All fields required unless marked optional</p>
      <h3 ref={heading} tabIndex={-1}>{chapters[step]}</h3>
      <fieldset disabled={sending} className="courtier-fields">
        {step === 0 && (
          <>
            <div className="courtier-identity">
              <label htmlFor="courtier-name">Full name<input id="courtier-name" autoComplete="name" required maxLength={200} value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>
              <label htmlFor="courtier-email">Email<input id="courtier-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            </div>
            <fieldset className="courtier-skill-field">
              <legend>Where can you contribute?</legend>
              <p className="courtier-small">Select all that apply.</p>
              <div className="courtier-options">
                {skills.map((skill) => (
                  <label key={skill} className={selected.includes(skill) ? "is-selected" : ""}>
                    <input type="checkbox" checked={selected.includes(skill)}
                      onChange={(event) => setSelected((items) => event.target.checked ? [...items, skill] : items.filter((item) => item !== skill))} />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}
        {questions.map((question) => (
          <div className="courtier-question" key={question.id}>
            <label htmlFor={`courtier-${question.id}`}>{question.label}</label>
            <p id={`courtier-${question.id}-hint`} className="courtier-small">{question.hint}</p>
            <textarea id={`courtier-${question.id}`} aria-describedby={`courtier-${question.id}-hint`}
              rows={4} required maxLength={question.max} value={answers[question.id]}
              onChange={(event) => setAnswers((previous) => ({ ...previous, [question.id]: event.target.value }))} />
          </div>
        ))}
        {step === 0 && <label htmlFor="courtier-portfolio">Portfolio or work sample <span className="courtier-small">(optional)</span>
          <input id="courtier-portfolio" type="url" placeholder="https://" maxLength={1000} value={portfolio} onChange={(event) => setPortfolio(event.target.value)} />
        </label>}
        {step === 2 && (
          <>
            <p className="courtier-small">Your application and contact details are stored for selection and service coordination. Share practical availability only; no sensitive personal information is needed.</p>
            <label className="courtier-confirm">
              <input type="checkbox" required checked={commitment} onChange={(event) => setCommitment(event.target.checked)} />
              <span>I understand this is an unpaid service role, not free admission. I will pay for my own access, contribute my skills, and commit to preparation, early arrival, and staying late as agreed with the team.</span>
            </label>
            <p className="courtier-small">Every application is reviewed by the team. No automatic selection.</p>
          </>
        )}
      </fieldset>
      {error && <p className="courtier-error" role="alert" ref={errorRef} tabIndex={-1}>{error}</p>}
      <div className="courtier-navigation">
        {step > 0 ? <button type="button" disabled={sending} className="courtier-back"
          onClick={() => { setStep(step - 1); setError("") }}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} aria-hidden="true" /> Back
        </button> : <span />}
        <button className="courtier-primary" disabled={sending} type="submit">
          {sending ? "Sending..." : step === 2 ? "Send my application" : "Continue"}
          {!sending && <HugeiconsIcon icon={ArrowRight01Icon} size={20} aria-hidden="true" />}
        </button>
      </div>
    </form>
  )
}
