'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { FormState } from './actions'

type Initial = {
  imageUrl?: string
  alt?: string
  linkUrl?: string
  sortOrder?: number
  isActive?: boolean
}

export default function BannerForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  initial?: Initial
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const editing = Boolean(initial)

  const input = 'mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm'
  const label = 'block text-sm font-medium'

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      {editing && initial?.imageUrl && (
        <div>
          <label className={label}>Current image</label>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={initial.imageUrl}
            alt=""
            className="mt-2 h-32 w-full max-w-sm rounded-md object-cover"
          />
        </div>
      )}

      <div>
        <label className={label}>{editing ? 'Replace image' : 'Image'}</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          required={!editing}
          className={input}
        />
        {editing && (
          <p className="mt-1 text-xs text-neutral-500">Leave blank to keep the current image.</p>
        )}
      </div>

      <div>
        <label className={label}>Alt text</label>
        <input
          name="alt"
          defaultValue={initial?.alt}
          required
          placeholder="Describe the banner for screen readers"
          className={input}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Link URL (optional)</label>
          <input
            name="linkUrl"
            defaultValue={initial?.linkUrl}
            placeholder="/products?category=women"
            className={input}
          />
        </div>
        <div>
          <label className={label}>Sort order</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={initial?.sortOrder ?? 0}
            className={input}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={initial?.isActive ?? true}
          className="h-4 w-4 rounded border-black/20"
        />
        Active (shown on the homepage)
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-60"
        >
          {pending ? 'Saving…' : submitLabel}
        </button>
        <Link href="/admin/banners" className="text-sm text-neutral-600 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  )
}
