'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/format'
import { useCart } from '@/lib/cart-context'
import WishlistButton from './WishlistButton'

type Variant = {
  id: string
  name: string
  priceCents: number
  stock: number
}

type Props = {
  slug: string
  name: string
  categoryName?: string | null
  description?: string | null
  imageUrl: string | null
  variants: Variant[]
}

const LOW_STOCK_THRESHOLD = 5

export default function ProductDetails({
  slug,
  name,
  categoryName,
  description,
  imageUrl,
  variants,
}: Props) {
  const { addItem, openCart } = useCart()
  // Default to the first in-stock variant so the price/stock shown is buyable.
  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0]
  const [selectedId, setSelectedId] = useState<string | undefined>(
    firstInStock?.id,
  )
  const [qty, setQty] = useState(1)
  const [flash, setFlash] = useState(false)

  const selected = variants.find((v) => v.id === selectedId) ?? firstInStock
  const stock = selected?.stock ?? 0
  const inStock = stock > 0
  const lowStock = inStock && stock <= LOW_STOCK_THRESHOLD
  const cheapestPriceCents =
    variants.length > 0 ? Math.min(...variants.map((v) => v.priceCents)) : null

  function selectVariant(id: string) {
    setSelectedId(id)
    setQty(1)
  }

  function addToCart() {
    if (!selected || !inStock) return
    addItem(
      {
        variantId: selected.id,
        productSlug: slug,
        name,
        variantName: selected.name,
        priceCents: selected.priceCents,
        imageUrl,
      },
      qty,
    )
    setFlash(true)
    setTimeout(() => setFlash(false), 3000)
    openCart()
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          {categoryName && (
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              {categoryName}
            </p>
          )}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {name}
          </h1>
        </div>
        <WishlistButton
          product={{ slug, name, imageUrl, priceCents: cheapestPriceCents }}
          className="h-11 w-11 shrink-0 ring-1 ring-black/10"
        />
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-semibold tracking-tight">
          {selected ? formatPrice(selected.priceCents) : '—'}
        </span>
        <span className="text-sm text-neutral-500">incl. taxes</span>
      </div>

      {description && (
        <p className="mt-5 leading-relaxed text-neutral-600">{description}</p>
      )}

      {/* Variant picker */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700">
            {categoryName === 'Shoes' ? 'Select size' : 'Select option'}
          </h2>
          {selected && (
            <span className="text-xs text-neutral-500">{selected.name}</span>
          )}
        </div>

        {variants.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            No options available for this product yet.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = v.id === selected?.id
              const soldOut = v.stock === 0
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => !soldOut && selectVariant(v.id)}
                  disabled={soldOut}
                  aria-pressed={isSelected}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isSelected
                      ? 'border-brand bg-brand/10 font-medium text-brand ring-1 ring-brand'
                      : soldOut
                        ? 'cursor-not-allowed border-black/10 text-neutral-400 line-through'
                        : 'border-black/15 text-neutral-700 hover:border-black/40'
                  }`}
                >
                  {v.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Stock status */}
      {selected && (
        <p className="mt-4 flex items-center gap-2 text-sm">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              inStock ? (lowStock ? 'bg-amber-500' : 'bg-green-500') : 'bg-red-500'
            }`}
            aria-hidden="true"
          />
          <span
            className={
              inStock
                ? lowStock
                  ? 'text-amber-600'
                  : 'text-green-700'
                : 'text-red-600'
            }
          >
            {inStock
              ? lowStock
                ? `Only ${stock} left in stock`
                : 'In stock, ready to ship'
              : 'Out of stock'}
          </span>
        </p>
      )}

      {/* Quantity + add to cart */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex items-center rounded-full border border-black/15">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={!inStock || qty <= 1}
            aria-label="Decrease quantity"
            className="grid h-11 w-11 place-items-center rounded-full text-lg text-neutral-600 transition hover:text-brand disabled:opacity-30"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">
            {inStock ? qty : 0}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            disabled={!inStock || qty >= stock}
            aria-label="Increase quantity"
            className="grid h-11 w-11 place-items-center rounded-full text-lg text-neutral-600 transition hover:text-brand disabled:opacity-30"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={addToCart}
          disabled={!inStock}
          className="flex-1 rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {inStock ? 'Add to cart' : 'Out of stock'}
        </button>
      </div>

      {flash && (
        <p className="mt-3 rounded-lg bg-brand/10 px-4 py-2.5 text-sm text-brand">
          Added to your cart.
        </p>
      )}

      {/* Trust row */}
      <ul className="mt-8 space-y-3 border-t border-black/10 pt-6 text-sm text-neutral-600">
        <li className="flex items-center gap-3">
          <TruckIcon />
          Free shipping on orders over Rs 15,000
        </li>
        <li className="flex items-center gap-3">
          <ReturnIcon />
          30-day, no-questions-asked returns
        </li>
        <li className="flex items-center gap-3">
          <ShieldIcon />
          Secure, encrypted checkout
        </li>
      </ul>
    </div>
  )
}

/* --- small inline icons (match the header's SVG style) --- */

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 shrink-0 text-brand"
      aria-hidden="true"
    >
      <path
        d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ReturnIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 shrink-0 text-brand"
      aria-hidden="true"
    >
      <path
        d="M4 9h11a5 5 0 010 10H8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 6L4 9l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 shrink-0 text-brand"
      aria-hidden="true"
    >
      <path
        d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
