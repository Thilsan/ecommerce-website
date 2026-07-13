'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/format'
import CartLineItem from './CartLineItem'

export default function CartSidebar() {
  const { items, isOpen, closeCart } = useCart()
  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)

  // Escape closes the sidebar; lock page scroll while it's open.
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, closeCart])

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight">
            Your cart {items.length > 0 && `(${items.length})`}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-full p-2 text-neutral-500 transition hover:bg-black/5 hover:text-neutral-900"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
            <p className="text-neutral-500">Your cart is empty.</p>
            <Link
              href="/products"
              onClick={closeCart}
              className="text-sm font-medium text-brand hover:underline"
            >
              Start shopping &rarr;
            </Link>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-black/5 overflow-y-auto px-5">
            {items.map((item) => (
              <CartLineItem key={item.variantId} item={item} onNavigate={closeCart} />
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <div className="space-y-3 border-t border-black/10 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotalCents)}</span>
            </div>
            <p className="text-xs text-neutral-500">Shipping and taxes calculated at checkout.</p>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full rounded-full bg-brand px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-brand/90"
            >
              View cart
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
