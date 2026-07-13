'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'

type Props = {
  product: { slug: string; name: string; imageUrl: string | null }
  variant: { id: string; name: string; priceCents: number; stock: number }
  className?: string
}

// Small "Add to cart" control meant to sit inside a card that's itself a link
// (e.g. ProductCard) — it stops the click from also triggering navigation.
export default function AddToCartButton({ product, variant, className = '' }: Props) {
  const { addItem, openCart } = useCart()
  const [added, setAdded] = useState(false)
  const soldOut = variant.stock <= 0

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (soldOut) return

    addItem({
      variantId: variant.id,
      productSlug: product.slug,
      name: product.name,
      variantName: variant.name,
      priceCents: variant.priceCents,
      imageUrl: product.imageUrl,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
    openCart()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      aria-label={soldOut ? 'Out of stock' : `Add ${product.name} to cart`}
      className={`flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-black text-white hover:bg-black/85'
      } ${className}`}
    >
      {soldOut ? 'Sold out' : added ? 'Added ✓' : 'Add to cart'}
    </button>
  )
}
