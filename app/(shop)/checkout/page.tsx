'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/format'
import { authClient } from '@/lib/auth-client'
import { placeOrder, type CheckoutState } from '@/app/(shop)/actions'

// Shown before the checkout form to anyone who isn't already signed in —
// mirrors the standard "guest / log in / register" fork most stores use.
function CheckoutGate({ onGuest }: { onGuest: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="rounded-xl border border-black/10 p-8 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-neutral-600">How would you like to check out?</p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onGuest}
            className="w-full rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition hover:bg-brand/90"
          >
            Continue as guest
          </button>
          <Link
            href="/login?redirect=/checkout"
            className="block w-full rounded-full border border-black/15 px-6 py-3 text-sm font-medium transition hover:border-black/30"
          >
            Log in
          </Link>
          <Link
            href="/register?redirect=/checkout"
            className="block w-full rounded-full border border-black/15 px-6 py-3 text-sm font-medium transition hover:border-black/30"
          >
            Create an account
          </Link>
        </div>
      </div>
      <Link href="/cart" className="mt-4 text-center text-sm text-neutral-500 hover:underline">
        &larr; Back to cart
      </Link>
    </main>
  )
}

export default function CheckoutPage() {
  const { items, hydrated, clear } = useCart()
  const router = useRouter()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [guestChosen, setGuestChosen] = useState(false)
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(placeOrder, {})
  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)

  // Wait for the cart to hydrate from localStorage before deciding it's empty,
  // and don't bounce back to /cart once an order has just been placed.
  useEffect(() => {
    if (hydrated && items.length === 0 && !state.orderId) router.replace('/cart')
  }, [hydrated, items.length, state.orderId, router])

  useEffect(() => {
    if (state.orderId) {
      clear()
      router.push(`/order-confirmation/${state.orderId}`)
    }
  }, [state.orderId, clear, router])

  const input = 'mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm'
  const label = 'block text-sm font-medium'

  // Wait to know whether there's a session before deciding to show the gate,
  // so a logged-in visitor doesn't see it flash before the form does.
  if (sessionPending) return <main className="flex-1" />

  if (!session?.user && !guestChosen) {
    return <CheckoutGate onGuest={() => setGuestChosen(true)} />
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <form action={formAction} className="space-y-5 lg:col-span-2">
          <input type="hidden" name="cartItems" value={JSON.stringify(items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })))} />

          {state.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}

          <section>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <input
                  name="customerName"
                  defaultValue={session?.user?.name}
                  required
                  placeholder="Full name"
                  aria-label="Full name"
                  className={input}
                />
              </div>
              <div>
                <input
                  name="customerEmail"
                  type="email"
                  defaultValue={session?.user?.email}
                  required
                  placeholder="Email address"
                  aria-label="Email address"
                  className={input}
                />
              </div>
              <div>
                <input
                  name="customerPhone"
                  type="tel"
                  required
                  placeholder="Phone number"
                  aria-label="Phone number"
                  className={input}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
              Shipping address
            </h2>
            <div className="mt-3 grid gap-4">
              <div>
                <label className={label}>Address line 1</label>
                <input name="shippingLine1" required className={input} />
              </div>
              <div>
                <label className={label}>Address line 2 (optional)</label>
                <input name="shippingLine2" className={input} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={label}>City</label>
                  <input name="shippingCity" required className={input} />
                </div>
                <div>
                  <label className={label}>Postal code</label>
                  <input name="shippingPostalCode" required className={input} />
                </div>
                <div>
                  <label className={label}>Country</label>
                  <input name="shippingCountry" defaultValue="Sri Lanka" required className={input} />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-black/10 p-4">
            <h2 className="text-sm font-semibold">Payment</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Cash on delivery — pay when your order arrives.
            </p>
          </section>

          <button
            type="submit"
            disabled={pending || items.length === 0}
            className="w-full rounded-full bg-brand px-6 py-3.5 text-sm font-medium text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'Placing order…' : `Place order — ${formatPrice(subtotalCents)}`}
          </button>
        </form>

        <aside className="rounded-xl border border-black/10 p-5">
          <h2 className="text-sm font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3 divide-y divide-black/5">
            {items.map((item) => (
              <li key={item.variantId} className="flex items-center gap-3 pt-3 first:pt-0">
                <div className="h-14 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-neutral-500">
                    {item.variantName} &times; {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium">
                  {formatPrice(item.priceCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotalCents)}</span>
          </div>
          <Link href="/cart" className="mt-3 inline-block text-sm text-neutral-500 hover:underline">
            &larr; Back to cart
          </Link>
        </aside>
      </div>
    </main>
  )
}
