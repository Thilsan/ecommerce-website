'use client'

import { useActionState, useEffect, useRef } from 'react'
import type { FormState } from './actions'

export default function CategoryForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const formRef = useRef<HTMLFormElement>(null)

  // Clear the input after a successful add.
  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset()
  }, [state, pending])

  return (
    <form ref={formRef} action={formAction} className="flex items-start gap-2">
      <div className="flex-1">
        <input
          name="name"
          placeholder="New category name"
          required
          className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
        {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-60"
      >
        {pending ? 'Adding…' : 'Add'}
      </button>
    </form>
  )
}
