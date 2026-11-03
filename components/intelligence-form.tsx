"use client"

import { useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import {
  DRAFT_KEY, FEEDBACK_ENDPOINT, facilitators, facilitatorOptions, feedbackPayload,
  isVisible, parseDraft, parseProgress, pillars, stages, type Answers, type Question,
} from "@/lib/intelligence"

type Mode = "anonymous" | "identified"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const emailInvalid = (email: string) => email.trim() !== "" && (email.trim().length > 254 || !EMAIL_PATTERN.test(email.trim()))
const plain = (option: string) => option.replace(/\.$/, "")

async function celebrate(big = false) {
  try {
    const { default: confetti } = await import("canvas-confetti")
    confetti({
      particleCount: big ? 170 : 70,
      spread: big ? 100 : 65,
      startVelocity: big ? 45 : 35,
      origin: { y: 0.7 },
      colors: ["#dc1dda", "#ed8aeb", "#5a60c7", "#f6f5ff"],
      disableForReducedMotion: true,
      zIndex: 1000,
    })
  } catch {
    // Celebration is decorative; never block progress on it.
  }
}

function Arrow({ back = false }: { back?: boolean }) {
  return <HugeiconsIcon icon={back ? ArrowLeft01Icon : ArrowRight01Icon} size={20} strokeWidth={1.5} aria-hidden="true" />
}

function Selection({
  id, options, value, multiple, onChange, descriptions, compact,
}: {
  id: string
  options: readonly string[]
  value: string | string[] | undefined
  multiple: boolean
  onChange: (value: string | string[]) => void
  descriptions?: readonly { name: string; description: string }[]
  compact?: boolean
}) {
  return (
    <div className={`voice-options ${descriptions ? "voice-pillar-options" : ""} ${compact ? "voice-compact-options" : ""}`}>
      {options.map((option, index) => {
        const checked = Array.isArray(value) ? value.includes(option) : value === option
        return (
          <label key={option} className={`voice-option ${checked ? "is-selected" : ""}`}>
            <input
              type={multiple ? "checkbox" : "radio"}
              name={id}
              value={option}
              checked={checked}
              onChange={() => {
                if (!multiple) return onChange(option)
                const selected = Array.isArray(value) ? value : []
                onChange(checked ? selected.filter((item) => item !== option) : [...selected, option])
              }}
            />
            {descriptions && <span className="voice-pillar-number">0{index + 1}</span>}
            <span className="voice-option-copy">
              <span>{plain(option)}</span>
              {descriptions && <small>{descriptions.find((item) => item.name === option)?.description}</small>}
            </span>
          </label>
        )
      })}
    </div>
  )
}

function QuestionField({ question, answers, update }: {
  question: Question
  answers: Answers
  update: (id: string, value: string | string[]) => void
}) {
  if (!isVisible(question, answers)) return null
  const value = answers[question.id]
  const otherSelected = Array.isArray(value) && value.includes("Other.")
  const hint = question.hint || (question.type === "multi" || question.type === "pillars" ? "Select all that apply" : "")
  const hintId = `${question.id}_hint`
  const contents = (
    <>
      <legend className="voice-question-title">{question.label}</legend>
      {hint && <p id={hintId} className="voice-field-hint">{hint}</p>}
      {question.type === "text" ? (
        <>
          <label className="sr-only" htmlFor={question.id}>{question.label}</label>
          <textarea id={question.id} name={question.id} rows={3} maxLength={4000} aria-describedby={hint ? hintId : undefined}
            value={typeof value === "string" ? value : ""} placeholder="Type here..."
            onChange={(event) => update(question.id, event.target.value)} />
        </>
      ) : (
        <>
          <Selection id={question.id} options={question.options ?? []} value={value}
            multiple={question.type !== "single"} descriptions={question.type === "pillars" ? pillars : undefined}
            onChange={(next) => update(question.id, next)} />
          {question.type === "single" && value && (
            <button type="button" className="voice-text-button voice-clear" onClick={() => update(question.id, "")}>Clear</button>
          )}
        </>
      )}
      {otherSelected && (
        <div className="voice-followup">
          <label htmlFor={`${question.id}_other`}>Tell us more</label>
          <textarea id={`${question.id}_other`} rows={2} maxLength={4000}
            value={typeof answers[`${question.id}_other`] === "string" ? answers[`${question.id}_other`] : ""}
            onChange={(event) => update(`${question.id}_other`, event.target.value)} />
        </div>
      )}
    </>
  )
  const pillarDetail = pillars.some((pillar) => question.id === `${pillar.name.toLowerCase()}_priorities`)
  if (pillarDetail) {
    return <details className="voice-pillar-detail"><summary>{question.label}</summary><fieldset className="voice-question">{contents}</fieldset></details>
  }
  return <fieldset className="voice-question" aria-describedby={hint ? hintId : undefined}>{contents}</fieldset>
}

export function IntelligenceForm() {
  const [screen, setScreen] = useState<"welcome" | "form" | "success">("welcome")
  const [stageIndex, setStageIndex] = useState(0)
  const [groupIndex, setGroupIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [mode, setMode] = useState<Mode | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const submissionLock = useRef(false)
  const errorRef = useRef<HTMLDivElement>(null)
  const initialRender = useRef(true)

  // Progress is restored automatically so people can pick up where they left off.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const restored = parseDraft(saved)
        const progress = parseProgress(saved)
        setAnswers(restored)
        setMode(progress.mode)
        setName(progress.name)
        setEmail(progress.email)
        setStageIndex(progress.stageIndex)
        setGroupIndex(progress.groupIndex)
      }
    } catch {
      // Unreadable or unavailable storage simply means starting fresh.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || screen === "success") return
    try {
      const identified = mode === "identified"
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        version: 1,
        answers,
        progress: { mode, name: identified ? name : "", email: identified ? email : "", stageIndex, groupIndex },
      }))
    } catch {
      // Answers stay on the page even if the browser blocks storage.
    }
  }, [hydrated, screen, answers, mode, name, email, stageIndex, groupIndex])

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }
    headingRef.current?.focus()
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [screen, stageIndex, groupIndex])

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  const stage = stages[stageIndex]
  const lastGroup = groupIndex === stage.groups.length - 1
  const finalReview = stageIndex === 5 && lastGroup
  const totalGroups = stages.reduce((total, item) => total + item.groups.length, 0)
  const completedGroups = stages.slice(0, stageIndex).reduce((total, item) => total + item.groups.length, 0) + groupIndex
  const progress = screen === "success" ? 100 : Math.round(completedGroups / totalGroups * 100)
  const started = stageIndex > 0 || groupIndex > 0 || Object.keys(answers).length > 0

  function update(id: string, value: string | string[]) {
    setAnswers((previous) => ({ ...previous, [id]: value }))
  }

  function changeMode(next: Mode) {
    setMode(next)
    setError(null)
    if (next === "anonymous") {
      setName("")
      setEmail("")
    }
  }

  function startOver() {
    setAnswers({})
    setStageIndex(0)
    setGroupIndex(0)
    setConfirmed(false)
    setError(null)
  }

  function identityValid() {
    if (!mode) {
      setError("Choose how you'd like to share your feedback to begin.")
      return false
    }
    if (mode === "identified" && !name.trim()) {
      setError("Please add your name, or choose to share anonymously.")
      return false
    }
    if (mode === "identified" && emailInvalid(email)) {
      setError("That email doesn't look right. Fix it or leave it empty.")
      return false
    }
    return true
  }

  function next() {
    setError(null)
    if (lastGroup) {
      void celebrate()
      setStageIndex((index) => index + 1)
      setGroupIndex(0)
    } else setGroupIndex((index) => index + 1)
  }

  function back() {
    setError(null)
    if (groupIndex > 0) setGroupIndex((index) => index - 1)
    else if (stageIndex > 0) {
      setGroupIndex(stages[stageIndex - 1].groups.length - 1)
      setStageIndex((index) => index - 1)
    } else setScreen("welcome")
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!finalReview) {
      next()
      return
    }
    if (submissionLock.current || !identityValid()) return
    if (!confirmed) {
      setError("Please tick the box to confirm you attended a previous Wealth Lab.")
      return
    }
    if (!mode) return
    submissionLock.current = true
    setSubmitting(true)
    setError(null)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    try {
      const response = await fetch(FEEDBACK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(feedbackPayload(answers, mode, name, email)),
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`Submission rejected (${response.status})`)
      const result: unknown = await response.json()
      if (!result || typeof result !== "object" || !("ok" in result) || result.ok !== true) {
        throw new Error("Submission was not confirmed")
      }
      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {
        // Nothing else to clean up; the saved copy is only local.
      }
      setScreen("success")
      setName("")
      setEmail("")
      setAnswers({})
      setConfirmed(false)
      setStageIndex(0)
      setGroupIndex(0)
      void celebrate(true)
    } catch (failure) {
      setError(failure instanceof Error && failure.name === "AbortError"
        ? "That took too long. Your answers are safe here. Check your connection and try again."
        : "We couldn't send your feedback. Your answers are safe here. Check your connection and try again.")
    } finally {
      window.clearTimeout(timeout)
      submissionLock.current = false
      setSubmitting(false)
    }
  }

  const identity = (
    <fieldset className="voice-identity">
      <legend>How would you like to share your feedback?</legend>
      <div className="voice-mode-options">
        <label className={mode === "identified" ? "is-selected" : ""}>
          <input type="radio" name="anonymity_preference" checked={mode === "identified"} onChange={() => changeMode("identified")} />
          <span>With my name</span>
        </label>
        <label className={mode === "anonymous" ? "is-selected" : ""}>
          <input type="radio" name="anonymity_preference" checked={mode === "anonymous"} onChange={() => changeMode("anonymous")} />
          <span>Anonymously</span>
        </label>
      </div>
      {mode === "identified" && (
        <div className="voice-identity-fields">
          <label htmlFor="feedback_name">Full name
            <input id="feedback_name" name="full_name" autoComplete="name" required maxLength={200} value={name} onChange={(event) => { setName(event.target.value); setError(null) }} />
          </label>
          <label htmlFor="feedback_email">Email <span className="voice-optional">optional</span>
            <input id="feedback_email" name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => { setEmail(event.target.value); setError(null) }} />
          </label>
        </div>
      )}
      <p className="voice-privacy-copy">
        {mode === "anonymous" ? "No name or email is attached." : "Used only for feedback analysis and community updates."}
      </p>
    </fieldset>
  )

  const errorMessage = error && (
    <div className="voice-error" ref={errorRef} role="alert" tabIndex={-1}>
      {error}
      {screen === "form" && (!mode || (mode === "identified" && (!name.trim() || emailInvalid(email)))) ? (
        <button type="button" className="voice-text-button" onClick={() => setScreen("welcome")}>Update sharing preference</button>
      ) : null}
    </div>
  )

  return (
    <div className="voice-page">
      <header className="voice-header">
        <a href="/" className="voice-wordmark" aria-label="Wealth Lab home">WEALTH <span>LAB</span><i /></a>
        <span className="voice-header-note"><span className="voice-dot" /> Private community conversation</span>
      </header>

      {screen === "welcome" ? (
        <main className="voice-welcome">
          <section className="voice-welcome-heading">
            <p className="voice-eyebrow"><span className="voice-dash" /> The next chapter begins with you</p>
            <h1 ref={headingRef} tabIndex={-1}>Your voice<br /><em>matters.</em><span className="voice-headline-period" /></h1>
            <p className="voice-welcome-subtitle">Your interests. Your experience.<br />What&apos;s next for Wealth Lab.</p>
            {/* <div className="voice-seal" aria-hidden="true"><span>HEALTH · PURPOSE</span><b>W<span>L</span></b><span>POWER · WEALTH</span></div> */}
          </section>

          <section className="voice-welcome-letter" aria-labelledby="welcome-letter-title">
            <h2 id="welcome-letter-title">An exceptional experience<br />starts with <em>your input.</em></h2>
            <p>We&apos;re planning the next edition, and we&apos;re thinking about <span className="voice-letter-emphasis">you.</span> Tell us what to keep, what to change, and what you&apos;d love to see in Wealth Lab 2027.</p>
            {identity}
            {errorMessage}
            <button type="button" className="voice-primary" onClick={() => {
              setError(null)
              if (identityValid()) setScreen("form")
            }}>{started ? "Continue where I left off" : "Shape what's next"} <Arrow /></button>
            {started && <button type="button" className="voice-text-button voice-start-over" onClick={startOver}>Start over</button>}
            <p className="voice-cta-note">For previous attendees · about 5–7 minutes · everything is optional</p>
          </section>
        </main>
      ) : screen === "success" ? (
        <main className="voice-success">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={56} strokeWidth={1} aria-hidden="true" />
          <h1 ref={headingRef} tabIndex={-1}>Heard.<br /><em>And appreciated.</em></h1>
          <p>Thank you for being part of the Wealth Lab community. Your feedback will help shape our next edition.</p>
          <a className="voice-primary" href="/">Return to Wealth Lab <Arrow /></a>
        </main>
      ) : (
        <main className="voice-form-layout">
          <aside className="voice-sidebar" aria-label="Your progress">
            <ol className="voice-stages">
              {stages.map((item, index) => (
                <li key={item.title} className={index === stageIndex ? "is-current" : index < stageIndex ? "is-complete" : ""} aria-current={index === stageIndex ? "step" : undefined}>
                  <button type="button" disabled={submitting || index > stageIndex} onClick={() => { setStageIndex(index); setGroupIndex(0); setError(null) }}>
                    <span className="voice-step-number">{index < stageIndex ? <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} aria-hidden="true" /> : `0${index + 1}`}</span>
                    <span>{item.shortTitle}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="voice-sidebar-bottom">
              <p>{mode === "anonymous" ? "Sharing anonymously" : "Sharing with your name"}</p>
              <button className="voice-text-button" type="button" disabled={submitting} onClick={() => { setScreen("welcome"); setError(null) }}>Change</button>
            </div>
          </aside>

          <section className="voice-form-panel">
            <div className="voice-progress-meta"><span>Chapter {stageIndex + 1} of {stages.length}</span><span>{progress}%</span></div>
            <div className="voice-progress-track" role="progressbar" aria-label="Feedback progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
            <button type="button" className="voice-text-button voice-mobile-sharing" disabled={submitting} onClick={() => { setScreen("welcome"); setError(null) }}>
              {mode === "anonymous" ? "Sharing anonymously" : "Sharing with your name"} · Change
            </button>
            <div className="voice-stage-heading" key={`${stageIndex}-${groupIndex}`}>
              <h1 ref={headingRef} tabIndex={-1}>{finalReview ? "Ready to send?" : stage.title}</h1>
              <p>{finalReview ? "Thank you for taking the time. One last check before you submit." : stage.intro}</p>
            </div>
            <form onSubmit={submit} noValidate>
              <fieldset disabled={submitting} className="voice-fields">
                {stage.groups[groupIndex].map((question) => <QuestionField key={question.id} question={question} answers={answers} update={update} />)}
                {stageIndex === 3 && groupIndex < 2 && (
                  <div className="voice-facilitators">
                    {facilitators.slice(groupIndex * 4, groupIndex * 4 + 4).map((person, index) => {
                      const id = `facilitator_interest_${groupIndex * 4 + index + 1}`
                      return (
                        <fieldset key={person.name} className="voice-profile">
                          <legend>{person.name}</legend>
                          <p className="voice-shortlisted">Shortlisted · Participation not yet confirmed</p>
                          <p className="voice-profile-background">
                            {person.background}
                            {"website" in person && <> <a href={person.website} target="_blank" rel="noopener noreferrer" className="voice-profile-link">Website <Arrow /></a></>}
                          </p>
                          <Selection id={id} options={facilitatorOptions} multiple compact value={answers[id]} onChange={(value) => update(id, value)} />
                        </fieldset>
                      )
                    })}
                  </div>
                )}
                {stageIndex === 3 && lastGroup && <blockquote className="voice-philosophy">We choose facilitators for capacity, depth and results, not popularity.</blockquote>}
                {finalReview && (
                  <>
                    <aside className="voice-disclaimer" aria-label="About this feedback exercise">
                      <p>For previous Wealth Lab attendees only. This is a private feedback exercise, not a registration or ticket reservation. We&apos;ll weigh recurring themes and feasibility, so not every request can be met.</p>
                    </aside>
                    <label className="voice-confirmation">
                      <input id="attendee_confirmation" type="checkbox" required checked={confirmed} onChange={(event) => { setConfirmed(event.target.checked); setError(null) }} />
                      <span>I confirm that I previously attended a Wealth Lab edition and understand the purpose of this feedback exercise.</span>
                    </label>
                  </>
                )}
              </fieldset>
              {errorMessage}
              <div className="voice-navigation">
                <button className="voice-back" type="button" disabled={submitting} onClick={back}><Arrow back /> Back</button>
                <button className="voice-primary" type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : finalReview ? "Submit my feedback" : lastGroup ? "Next chapter" : "Continue"} {!submitting && <Arrow />}
                </button>
              </div>
            </form>
          </section>
        </main>
      )}
      <footer className="voice-footer">The Wealth Lab 2027.</footer>
    </div>
  )
}
