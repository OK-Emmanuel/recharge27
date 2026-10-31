"use client"

import { useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import {
  DRAFT_KEY, FEEDBACK_ENDPOINT, facilitators, facilitatorOptions, feedbackPayload,
  isVisible, parseDraft, pillars, stages, type Answers, type Question,
} from "@/lib/intelligence"

type Mode = "anonymous" | "identified"

function Arrow({ back = false }: { back?: boolean }) {
  return <HugeiconsIcon icon={back ? ArrowLeft01Icon : ArrowRight01Icon} size={19} strokeWidth={1.5} aria-hidden="true" />
}

function Selection({
  id, options, value, multiple, onChange, descriptions,
}: {
  id: string
  options: readonly string[]
  value: string | string[] | undefined
  multiple: boolean
  onChange: (value: string | string[]) => void
  descriptions?: readonly { name: string; description: string }[]
}) {
  return (
    <div className={`voice-options ${descriptions ? "voice-pillar-options" : ""}`}>
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
              <span>{option}</span>
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
  const hintId = `${question.id}_hint`
  const contents = (
    <>
      <legend className="voice-question-title">{question.label}<span className="voice-optional">Optional</span></legend>
      <p id={hintId} className="voice-field-hint">
        {question.hint || (question.type === "multi" || question.type === "pillars" ? "Choose all that resonate with you." : question.type === "single" ? "Choose one, or leave this open." : "A few words or a little more. It's entirely up to you.")}
      </p>
      {question.type === "text" ? (
        <>
          <label className="sr-only" htmlFor={question.id}>{question.label}</label>
          <textarea id={question.id} name={question.id} rows={3} maxLength={4000} aria-describedby={hintId}
            value={typeof value === "string" ? value : ""} placeholder="Your perspective..."
            onChange={(event) => update(question.id, event.target.value)} />
        </>
      ) : (
        <>
          <Selection id={question.id} options={question.options ?? []} value={value}
            multiple={question.type !== "single"} descriptions={question.type === "pillars" ? pillars : undefined}
            onChange={(next) => update(question.id, next)} />
          {question.type === "single" && value && (
            <button type="button" className="voice-text-button voice-clear" onClick={() => update(question.id, "")}>Clear selection</button>
          )}
        </>
      )}
      {otherSelected && (
        <div className="voice-followup">
          <label htmlFor={`${question.id}_other`}>Something else? Tell us more <span className="voice-optional">Optional</span></label>
          <textarea id={`${question.id}_other`} rows={2} maxLength={4000}
            value={typeof answers[`${question.id}_other`] === "string" ? answers[`${question.id}_other`] : ""}
            onChange={(event) => update(`${question.id}_other`, event.target.value)} />
        </div>
      )}
    </>
  )
  const pillarDetail = pillars.some((pillar) => question.id === `${pillar.name.toLowerCase()}_priorities`)
  if (pillarDetail) {
    return <details className="voice-pillar-detail"><summary>{question.label} <span>Optional</span></summary><fieldset className="voice-question">{contents}</fieldset></details>
  }
  return <fieldset className="voice-question" aria-describedby={hintId}>{contents}</fieldset>
}

function Disclaimer() {
  return (
    <aside className="voice-disclaimer" aria-labelledby="disclaimer-title">
      <p className="voice-eyebrow" id="disclaimer-title">About this feedback exercise</p>
      <p>This form is exclusively intended for individuals who attended a previous Wealth Lab edition.</p>
      <p>It is a private community feedback and expectation-gathering exercise. It is not an official registration form, ticket reservation, or confirmation of attendance for the next edition.</p>
      <p>The objective is to understand members&apos; experiences, preferences, and expectations so that we can make more informed decisions when curating future Wealth Lab experiences.</p>
      <p>While we genuinely value every contribution, we recognise that members have different interests, preferences, and expectations. It may not be possible to accommodate every individual request or create a completely unique experience for everyone.</p>
      <p>We will prioritise recurring interests, meaningful suggestions, feasibility, and the overall value to the community when making curation decisions.</p>
      <p>This feedback form is intended exclusively for previous attendees and should not be forwarded or shared outside the private Wealth Lab community.</p>
    </aside>
  )
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
  const [draft, setDraft] = useState<Answers | null>(null)
  const [draftNotice, setDraftNotice] = useState("")
  const headingRef = useRef<HTMLHeadingElement>(null)
  const submissionLock = useRef(false)
  const errorRef = useRef<HTMLDivElement>(null)
  const initialRender = useRef(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) setDraft(parseDraft(saved))
    } catch {
      setDraftNotice("We couldn't read a saved draft in this browser. You can still complete and submit your feedback.")
    }
  }, [])

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

  function update(id: string, value: string | string[]) {
    setAnswers((previous) => ({ ...previous, [id]: value }))
    setDraftNotice("")
  }

  function changeMode(next: Mode) {
    setMode(next)
    setError(null)
    if (next === "anonymous") {
      setName("")
      setEmail("")
    }
  }

  function identityValid() {
    if (!mode) {
      setError("Choose how you'd like to share your feedback before we begin.")
      return false
    }
    if (mode === "identified" && !name.trim()) {
      setError("Please share your full name, or choose to contribute anonymously.")
      return false
    }
    if (mode === "identified" && email.trim() && (email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))) {
      setError("Please enter a valid email address, or leave this optional field empty.")
      return false
    }
    return true
  }

  function next() {
    setError(null)
    if (lastGroup) {
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

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, answers }))
      setDraft(answers)
      setDraftNotice("Draft saved on this browser only. Your name and email are not saved. Save again after making changes.")
    } catch {
      setDraftNotice("Your draft couldn't be saved. Keep this page open to retain your answers, or submit when you're ready.")
    }
  }

  function deleteDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY)
      setDraft(null)
      setDraftNotice("Saved draft deleted. Your answers on this page are unchanged.")
    } catch {
      setDraftNotice("We couldn't delete the saved draft. You can remove it through your browser's site data settings.")
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!finalReview) {
      next()
      return
    }
    if (submissionLock.current || !identityValid()) return
    if (!confirmed) {
      setError("Please confirm that you previously attended Wealth Lab and understand this feedback exercise.")
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
      setScreen("success")
      setName("")
      setEmail("")
      setAnswers({})
      setDraft(null)
      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {
        setDraftNotice("Your feedback was submitted, but the saved draft couldn't be removed. Please clear this browser's site data if you're on a shared device.")
      }
    } catch (failure) {
      setError(failure instanceof Error && failure.name === "AbortError"
        ? "We couldn't confirm your submission in time. Your answers are still here. Please check your connection before trying again."
        : "We couldn't confirm your submission. Your answers are still here. Please check your connection and try again.")
    } finally {
      window.clearTimeout(timeout)
      submissionLock.current = false
      setSubmitting(false)
    }
  }

  const identity = (
    <fieldset className="voice-identity">
      <legend>How would you like to share your feedback? <span className="voice-optional">Required</span></legend>
      <div className="voice-mode-options">
        <label className={mode === "identified" ? "is-selected" : ""}>
          <input type="radio" name="anonymity_preference" checked={mode === "identified"} onChange={() => changeMode("identified")} />
          <span>With my identity<small>A personal contribution</small></span>
        </label>
        <label className={mode === "anonymous" ? "is-selected" : ""}>
          <input type="radio" name="anonymity_preference" checked={mode === "anonymous"} onChange={() => changeMode("anonymous")} />
          <span>Anonymously<small>Your perspective, without your name</small></span>
        </label>
      </div>
      {mode === "identified" && (
        <div className="voice-identity-fields">
          <label htmlFor="feedback_name">Full name <span className="voice-optional">Required</span>
            <input id="feedback_name" name="full_name" autoComplete="name" required maxLength={200} value={name} onChange={(event) => { setName(event.target.value); setError(null) }} />
          </label>
          <label htmlFor="feedback_email">Email address <span className="voice-optional">Optional</span>
            <input id="feedback_email" name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => { setEmail(event.target.value); setError(null) }} />
          </label>
          <p>Your information will be used only for feedback analysis and relevant community communication.</p>
        </div>
      )}
      <p className="voice-privacy-copy">
        {mode === "anonymous" ? "We won't ask for or attach your name or email. Avoid identifying yourself in written answers. " : ""}
        Responses are stored in our database. Our hosting infrastructure may retain IP addresses or technical logs; we cannot promise complete technical anonymity. No analytics or tracking have been added to this page.
      </p>
    </fieldset>
  )

  const errorMessage = error && (
    <div className="voice-error" ref={errorRef} role="alert" tabIndex={-1}>
      {error}
      {screen === "form" && (!mode || (mode === "identified" && (!name.trim() || (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))))) ? (
        <button type="button" className="voice-text-button" onClick={() => setScreen("welcome")}>Review sharing preferences</button>
      ) : null}
    </div>
  )

  return (
    <div className="voice-page">
      <header className="voice-header">
        <a href="/" className="voice-wordmark" aria-label="Wealth Lab home">WEALTH <span>LAB</span><i /></a>
        <span className="voice-header-note"><span className="voice-dot" /> A private community conversation</span>
      </header>

      {screen === "welcome" ? (
        <main className="voice-welcome">
          <section className="voice-welcome-heading">
            <p className="voice-eyebrow"><span className="voice-dash" /> The next chapter begins with you</p>
            <h1 ref={headingRef} tabIndex={-1}>Your voice<br /><em>matters.</em><span className="voice-headline-period" /></h1>
            <p className="voice-welcome-subtitle">Your Interests. Your Experience.<br />What&apos;s Next for Wealth Lab.</p>
            <div className="voice-seal" aria-hidden="true"><span>HEALTH · PURPOSE</span><b>W<span>L</span></b><span>POWER · WEALTH</span></div>
            <p className="voice-margin-note">Not simply designed for you.<br /><span>Thoughtfully shaped with you.</span></p>
          </section>

          <section className="voice-welcome-letter" aria-labelledby="welcome-letter-title">
            <p className="voice-eyebrow">Your voice matters. Help us shape what&apos;s next.</p>
            <h2 id="welcome-letter-title">An exceptional experience<br />starts with <em>listening.</em></h2>
            <p>There&apos;s something exciting taking shape at Wealth Lab. As we work behind the scenes towards the next edition, we&apos;re thinking beyond speakers, schedules, and programme structures.</p>
            <p className="voice-letter-emphasis">We&apos;re thinking about <span>you.</span></p>
            <p>What made your previous experience memorable? What could have been better? What knowledge, perspectives, connections, and opportunities would make your next Wealth Lab experience truly worthwhile?</p>
            <p>We believe exceptional experiences are not simply designed for a community. They are shaped with the community. Your feedback will help us curate what comes next across Health, Purpose, Power, and Wealth.</p>
            <p>This is your opportunity to tell us what matters to you. Let&apos;s make what&apos;s next even more meaningful.</p>
            {draft && <div className="voice-draft-banner">
              <p>You have a saved draft in this browser.</p>
              <button type="button" className="voice-text-button" onClick={() => { setAnswers(draft); setDraftNotice("Draft restored. Choose your sharing preference to continue; your identity was not saved.") }}>Restore draft</button>
              <button type="button" className="voice-text-button" onClick={deleteDraft}>Delete draft</button>
            </div>}
            {identity}
            {errorMessage}
            <button type="button" className="voice-primary" onClick={() => {
              setError(null)
              if (identityValid()) { setStageIndex(0); setGroupIndex(0); setScreen("form") }
            }}>Shape what&apos;s next <Arrow /></button>
            <p className="voice-cta-note">Exclusively for previous Wealth Lab attendees.<br />Approximately 5–7 minutes. Every perspective is welcome.</p>
            <p className="voice-storage-note">Answers stay on this page as you move between steps. They are not saved after closing or refreshing unless you choose &ldquo;Save draft&rdquo;.</p>
          </section>
        </main>
      ) : screen === "success" ? (
        <main className="voice-success">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={56} strokeWidth={1} aria-hidden="true" />
          <p className="voice-eyebrow">A contribution that matters</p>
          <h1 ref={headingRef} tabIndex={-1}>Heard.<br /><em>And appreciated.</em></h1>
          <p>Thank you for being part of the Wealth Lab community. Your voice matters, and we appreciate you taking the time to share your experience, expectations, and ideas.</p>
          <p>Your feedback will contribute to the conversations and decisions shaping our next edition.</p>
          <p>We look forward to creating something exceptional together.</p>
          <a className="voice-primary" href="/">Return to Wealth Lab <Arrow /></a>
          {draftNotice && <p role="status" className="voice-storage-note">{draftNotice}</p>}
        </main>
      ) : (
        <main className="voice-form-layout">
          <aside className="voice-sidebar" aria-label="Your progress">
            <p className="voice-eyebrow">Your voice. Your interests.<br />Your Wealth Lab experience.</p>
            <h2>A better next chapter.<br /><em>Written together.</em></h2>
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
              <p>{mode === "anonymous" ? "Contributing anonymously" : "Contributing with your identity"}</p>
              <button className="voice-text-button" type="button" disabled={submitting} onClick={() => { setScreen("welcome"); setError(null) }}>Change sharing preference</button>
              <p>Your honesty is welcome here.<br />All feedback questions are optional.</p>
            </div>
          </aside>

          <section className="voice-form-panel">
            <div className="voice-progress-meta"><span>Chapter 0{stageIndex + 1} <span className="voice-muted">/ 06</span></span><span>{progress}% of the journey</span></div>
            <div className="voice-progress-track" role="progressbar" aria-label="Feedback journey" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
            <button type="button" className="voice-text-button voice-mobile-sharing" disabled={submitting} onClick={() => { setScreen("welcome"); setError(null) }}>
              {mode === "anonymous" ? "Anonymous contribution" : "Identified contribution"} · Change
            </button>
            <div className="voice-stage-heading" key={`${stageIndex}-${groupIndex}`}>
              <p className="voice-eyebrow">{finalReview ? "Before you send" : `Part ${groupIndex + 1} of ${stage.groups.length} · ${stage.shortTitle}`}</p>
              <h1 ref={headingRef} tabIndex={-1}>{finalReview ? "Your perspective. Our next chapter." : stage.title}</h1>
              <p>{finalReview ? "Thank you for making space for this conversation. Review any chapter using Back before sending, and take a moment to read the note below." : stage.intro}</p>
            </div>
            <form onSubmit={submit} noValidate>
              <fieldset disabled={submitting} className="voice-fields">
                {stage.groups[groupIndex].map((question) => <QuestionField key={question.id} question={question} answers={answers} update={update} />)}
                {stageIndex === 3 && groupIndex < 2 && (
                  <div className="voice-facilitators">
                    <div className="voice-curation-note"><p className="voice-eyebrow">Shortlisted potential facilitators</p><p>Participation is not yet confirmed for any of these individuals. Choose all expressions of interest that apply to each person, or leave their profile open.</p></div>
                    {facilitators.slice(groupIndex * 4, groupIndex * 4 + 4).map((person, index) => {
                      const id = `facilitator_interest_${groupIndex * 4 + index + 1}`
                      return (
                        <fieldset key={person.name} className="voice-profile">
                          <legend>{person.name}</legend>
                          <p className="voice-shortlisted">Shortlisted — Participation Not Yet Confirmed.</p>
                          <p className="voice-profile-background">{person.background}</p>
                          {"website" in person && <a href={person.website} target="_blank" rel="noopener noreferrer" className="voice-profile-link">Professional association website <Arrow /></a>}
                          <Selection id={id} options={facilitatorOptions} multiple value={answers[id]} onChange={(value) => update(id, value)} />
                        </fieldset>
                      )
                    })}
                  </div>
                )}
                {stageIndex === 3 && lastGroup && <blockquote className="voice-philosophy">At Wealth Lab, we are intentional about who facilitates our experiences. Our curation is not driven by social media popularity, public validation, or online visibility. We look for capacity, depth, experience, and the ability to translate knowledge into meaningful results.</blockquote>}
                {finalReview && (
                  <>
                    <div className="voice-review-summary">
                      <p className="voice-eyebrow">Your contribution</p>
                      <p>{mode === "anonymous" ? "Anonymous feedback. No name or email will be attached." : `Identified feedback from ${name.trim()}${email.trim() ? ` (${email.trim()})` : ""}.`}</p>
                      <p>Only your selected answers and written responses will be sent. Empty questions are welcome.</p>
                    </div>
                    <Disclaimer />
                    <label className="voice-confirmation">
                      <input id="attendee_confirmation" type="checkbox" required checked={confirmed} onChange={(event) => { setConfirmed(event.target.checked); setError(null) }} />
                      <span>I confirm that I previously attended a Wealth Lab edition and understand the purpose of this feedback exercise. <b>Required</b></span>
                    </label>
                  </>
                )}
              </fieldset>
              {errorMessage}
              <div className="voice-navigation">
                <button className="voice-back" type="button" disabled={submitting} onClick={back}><Arrow back /> Back</button>
                <button className="voice-primary" type="submit" disabled={submitting}>
                  {submitting ? "Sending your feedback..." : finalReview ? "Submit my feedback" : lastGroup ? "Next chapter" : "Continue"} {!submitting && <Arrow />}
                </button>
              </div>
              <div className="voice-draft-controls">
                <button type="button" className="voice-text-button" disabled={submitting} onClick={saveDraft}>Save draft</button>
                {draft && <button type="button" className="voice-text-button" disabled={submitting} onClick={deleteDraft}>Delete saved draft</button>}
                <span>Optional · stored on this browser, without your name or email.</span>
              </div>
              <p className="voice-storage-note">On a shared device? Avoid saving a draft. Responses are sent only when you submit; draft saving uses this browser&apos;s local storage.</p>
            </form>
          </section>
        </main>
      )}
      {screen !== "success" && <p role="status" className="voice-draft-status">{draftNotice}</p>}
      <footer className="voice-footer"><span>WEALTH LAB <span className="voice-muted">/</span> Beyond Wealth. Towards a More Intentional Life.</span><span>Health · Purpose · Power · Wealth</span></footer>
    </div>
  )
}
