'use client'

import { useActionState, useEffect, useRef } from 'react'
import { changeOwnPassword, type UserFormState } from './user-actions'

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(
    changeOwnPassword,
    {},
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state])

  const input = 'mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm'

  return (
    <form ref={formRef} action={formAction} className="max-w-sm space-y-4">
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.success}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium">Current password</label>
        <input name="currentPassword" type="password" required className={input} />
      </div>
      <div>
        <label className="block text-sm font-medium">New password</label>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          placeholder="min 8 characters"
          className={input}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-60"
      >
        {pending ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}
