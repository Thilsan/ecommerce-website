'use client'

import { useActionState, useEffect, useState } from 'react'
import { updateCategory, deleteCategory, type FormState } from './actions'

type Category = { id: string; name: string; slug: string; productCount: number }

export default function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateCategory, {})

  useEffect(() => {
    if (state.ok) setEditing(false)
  }, [state])

  if (editing) {
    return (
      <li className="px-5 py-3">
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={category.id} />
          <input
            name="name"
            defaultValue={category.name}
            autoFocus
            required
            className="flex-1 rounded-md border border-black/15 px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-sky-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-60"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:underline"
          >
            Cancel
          </button>
        </form>
        {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      </li>
    )
  }

  return (
    <li className="flex items-center justify-between px-5 py-3 text-sm">
      <div>
        <p className="font-medium">{category.name}</p>
        <p className="text-xs text-neutral-500">
          {category.productCount} product{category.productCount === 1 ? '' : 's'} ·{' '}
          <span className="font-mono">/{category.slug}</span>
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setEditing(true)}
          className="font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
        >
          Rename
        </button>
        <form action={deleteCategory}>
          <input type="hidden" name="id" value={category.id} />
          <button type="submit" className="font-medium text-red-600 hover:underline">
            Delete
          </button>
        </form>
      </div>
    </li>
  )
}
