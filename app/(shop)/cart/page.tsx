'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/format'
import CartLineItem from '@/app/components/CartLineItem'

export default function CartPage() {
  const { items } = useCart()
  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-black/10 py-20 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-neutral-100 text-neutral-400">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <path d="M6 7h12l-1 12a2 2 0 0 1-2 1.8H9A2 2 0 0 1 7 19L6 7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Your cart is empty</h1>
            <p className="mt-1 text-sm text-neutral-500">Looks like you haven&apos;t added anything yet.</p>
          </div>
          <Link
            href="/products"
            className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition hover:bg-brand/90"
          >
            Start shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        Your cart <span className="text-neutral-400">({items.length})</span>
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <ul className="divide-y divide-black/5 border-y border-black/10 lg:col-span-2">
          {items.map((item) => (
            <CartLineItem key={item.variantId} item={item} imageClassName="h-24 w-20" />
          ))}
        </ul>

        <aside className="h-fit rounded-xl border border-black/10 p-5">
          <h2 className="text-sm font-semibold">Order summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotalCents)}</span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">Shipping and taxes calculated at checkout.</p>

          <Link
            href="/checkout"
            className="mt-5 block w-full rounded-full bg-brand px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-brand/90"
          >
            Proceed to checkout
          </Link>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm text-neutral-500 hover:underline"
          >
            &larr; Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  )
}
