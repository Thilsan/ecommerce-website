'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createUser, type UserFormState } from './user-actions'

export default function CreateUserForm() {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(
    createUser,
    {},
  )
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state])

  const input = 'w-full rounded-md border border-black/15 px-3 py-2 text-sm'

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold"
      >
        Add user
        <span className="text-neutral-400">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <form
          ref={formRef}
          action={formAction}
          className="grid gap-4 border-t border-neutral-200 p-5 sm:grid-cols-2"
        >
          {state.error && (
            <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="sm:col-span-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              {state.success}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium">Name</label>
            <input name="name" className={`mt-1 ${input}`} />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input name="email" type="email" required className={`mt-1 ${input}`} />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="min 8 characters"
              className={`mt-1 ${input}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select name="role" defaultValue="user" className={`mt-1 ${input}`}>
              <option value="user">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-60"
            >
              {pending ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
