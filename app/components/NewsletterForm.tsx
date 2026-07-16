'use client'

import { useActionState, useEffect, useRef } from 'react'
import { subscribeNewsletter, type NewsletterState } from './newsletter-actions'

export default function NewsletterForm() {
  const [state, formAction, pending] = useActionState<NewsletterState, FormData>(
    subscribeNewsletter,
    {},
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state])

  return (
    <div>
      <form ref={formRef} action={formAction} className="flex flex-col gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="Enter your email address"
          className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-md bg-brand px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Submitting…' : 'Submit'}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-300">{state.error}</p>}
      {state.success && <p className="mt-2 text-sm text-white/70">{state.success}</p>}
    </div>
  )
}
