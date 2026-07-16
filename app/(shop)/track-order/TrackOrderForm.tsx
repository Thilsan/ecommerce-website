'use client'

import { useActionState } from 'react'
import { formatPrice } from '@/lib/format'
import { lookupGuestOrder, type TrackOrderState } from './actions'

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-green-50 text-green-700',
  shipped: 'bg-sky-50 text-sky-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  refunded: 'bg-neutral-100 text-neutral-600',
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TrackOrderForm() {
  const [state, formAction, pending] = useActionState<TrackOrderState, FormData>(lookupGuestOrder, {})
  const input = 'mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm'

  return (
    <div>
      <form action={formAction} className="space-y-4">
        {state.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        <div>
          <label className="block text-sm font-medium">Order number</label>
          <input
            name="orderId"
            required
            placeholder="e.g. a1b2c3d4"
            className={`${input} font-mono`}
          />
          <p className="mt-1 text-xs text-neutral-500">
            The short code shown on your order confirmation page (starts with #).
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium">Email address</label>
          <input name="email" type="email" required placeholder="you@example.com" className={input} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Looking up…' : 'Track order'}
        </button>
      </form>

      {state.order && (
        <div className="mt-8 overflow-hidden rounded-xl border border-black/10">
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <div>
              <h2 className="font-mono text-sm font-semibold">#{state.order.id.slice(0, 8)}</h2>
              <p className="text-xs text-neutral-500">{formatDate(state.order.createdAt)}</p>
            </div>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                statusStyles[state.order.status] ?? 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {state.order.status}
            </span>
          </div>
          <ul className="divide-y divide-black/5 px-5">
            {state.order.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{it.productName}</p>
                  <p className="text-xs text-neutral-500">
                    {it.variantName} &times; {it.quantity}
                  </p>
                </div>
                <span className="font-medium">{formatPrice(it.unitPriceCents * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-black/10 px-5 py-4">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-sm font-semibold">{formatPrice(state.order.totalCents)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
