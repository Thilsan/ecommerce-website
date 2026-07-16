'use client'

import { useActionState, useEffect, useState } from 'react'
import { formatPrice } from '@/lib/format'
import OrderStatusStepper from '@/app/components/OrderStatusStepper'
import { lookupGuestOrder, type TrackOrderState } from './actions'

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  paid: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  shipped: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  delivered: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  cancelled: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  refunded: 'bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-neutral-200',
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function OrderModal({ order, onClose }: { order: NonNullable<TrackOrderState['order']>; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_.15s_ease-out]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order details"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-[modalIn_.18s_ease-out]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/5 text-neutral-500 transition hover:bg-black/10 hover:text-neutral-900"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className="border-b border-black/10 bg-neutral-50 px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Order</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <h2 className="font-mono text-lg font-semibold tracking-tight">#{order.id.slice(0, 8)}</h2>
            <span
              className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                statusStyles[order.status] ?? 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-neutral-500">Placed {formatDate(order.createdAt)}</p>

          <div className="mt-5">
            <OrderStatusStepper status={order.status} />
          </div>
        </div>

        {order.deliveryPersonName && (order.status === 'shipped' || order.status === 'delivered') && (
          <div className="border-b border-black/10 px-6 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {order.status === 'delivered' ? 'Delivered by' : 'Out for delivery with'}
            </p>
            <p className="mt-1 text-sm font-medium">{order.deliveryPersonName}</p>
            {order.deliveryPersonPhone && (
              <p className="text-sm text-neutral-500">{order.deliveryPersonPhone}</p>
            )}
          </div>
        )}

        <ul className="max-h-64 divide-y divide-black/5 overflow-y-auto px-6">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-4 py-3.5 text-sm">
              <div>
                <p className="font-medium">{it.productName}</p>
                <p className="text-xs text-neutral-500">
                  {it.variantName} &times; {it.quantity}
                </p>
              </div>
              <span className="shrink-0 font-medium tabular-nums">
                {formatPrice(it.unitPriceCents * it.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-black/10 bg-neutral-50 px-6 py-4">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-base font-semibold tabular-nums">{formatPrice(order.totalCents)}</span>
        </div>
      </div>
    </div>
  )
}

export default function TrackOrderForm() {
  const [state, formAction, pending] = useActionState<TrackOrderState, FormData>(lookupGuestOrder, {})
  const [dismissed, setDismissed] = useState(false)
  const input = 'mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm'

  useEffect(() => {
    if (state.order) setDismissed(false)
  }, [state.order])

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

      {state.order && !dismissed && (
        <OrderModal order={state.order} onClose={() => setDismissed(true)} />
      )}
    </div>
  )
}
