'use client'

import { useActionState, useEffect, useRef } from 'react'
import type { AccountFormState } from './actions'

type Initial = {
  line1?: string
  line2?: string | null
  city?: string
  postalCode?: string
  country?: string
}

export default function AddressForm({
  action,
  initial,
  submitLabel,
  onDone,
}: {
  action: (prev: AccountFormState, formData: FormData) => Promise<AccountFormState>
  initial?: Initial
  submitLabel: string
  onDone?: () => void
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      onDone?.()
    }
    // onDone is stable enough here — re-running on every render would fire it on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const input = 'mt-1 w-full rounded-md border border-black/15 px-3 py-1.5 text-sm'
  const label = 'block text-xs font-medium text-neutral-600'

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <div>
        <label className={label}>Address line 1</label>
        <input name="line1" defaultValue={initial?.line1} required className={input} />
      </div>
      <div>
        <label className={label}>Address line 2 (optional)</label>
        <input name="line2" defaultValue={initial?.line2 ?? undefined} className={input} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={label}>City</label>
          <input name="city" defaultValue={initial?.city} required className={input} />
        </div>
        <div>
          <label className={label}>Postal code</label>
          <input name="postalCode" defaultValue={initial?.postalCode} required className={input} />
        </div>
        <div>
          <label className={label}>Country</label>
          <input
            name="country"
            defaultValue={initial?.country ?? 'Sri Lanka'}
            required
            className={input}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Saving…' : submitLabel}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="text-sm text-neutral-600 hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
