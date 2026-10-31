"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useForm } from "@formspree/react"
import { site } from "@/lib/site"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Fields = { email: string; _gotcha?: string }

function validateEmail(value: string): string | null {
  const email = value.trim()
  if (!email) return "Please enter your email address."
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return "Please enter a valid email address."
  return null
}

export function NotifyForm() {
  const [state, submit] = useForm<Fields>(site.formspreeFormId)
  const [clientError, setClientError] = useState<string | null>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const inputId = useId()
  const errorId = useId()

  useEffect(() => {
    if (state.succeeded) successRef.current?.focus()
  }, [state.succeeded])

  if (state.succeeded) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="mx-auto w-full max-w-xl border border-accent/30 bg-ink-soft/70 px-6 py-8 text-center outline-none backdrop-blur-sm sm:px-10"
      >
        <p className="font-serif text-3xl italic text-accent-bright">Your request has been received.</p>
        <p className="mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed text-mist">
          Every request is reviewed personally. If you are approved, we will write to you directly. Approval,
          not registration, determines who is in the room.
        </p>
      </div>
    )
  }

  const hasFieldError = (state.errors?.getFieldErrors("email").length ?? 0) > 0
  const serverMessage = hasFieldError
    ? "Please enter a valid email address."
    : state.errors
      ? "We couldn't send your request. Please check your connection and try again."
      : null
  const error = clientError ?? serverMessage

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    const value = new FormData(event.currentTarget).get("email")
    const problem = validateEmail(typeof value === "string" ? value : "")
    if (problem) {
      event.preventDefault()
      setClientError(problem)
      return
    }
    setClientError(null)
    void submit(event)
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto w-full max-w-xl text-left">
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <input
          id={inputId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Your email address"
          maxLength={254}
          required
          disabled={state.submitting}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={() => clientError && setClientError(null)}
          className="min-h-12 w-full flex-1 border-0 border-b border-accent/40 bg-transparent px-0 py-2 text-base text-ivory outline-none transition-colors duration-300 placeholder:text-mist/70 focus:border-accent-bright disabled:opacity-60 aria-[invalid=true]:border-danger"
        />

        {/* Honeypot: hidden from people and assistive tech, filled in by bots */}
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        <button
          type="submit"
          disabled={state.submitting}
          className="min-h-12 cursor-pointer bg-primary px-7 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-ivory transition-colors duration-300 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright disabled:cursor-progress disabled:opacity-70 sm:whitespace-nowrap"
        >
          {state.submitting ? "Sending…" : "I want to be in the room"}
        </button>
      </div>

      <div aria-live="polite" className="min-h-6 pt-3">
        {error && (
          <p id={errorId} className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </form>
  )
}
