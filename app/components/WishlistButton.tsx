'use client'

import { useWishlist } from '@/lib/wishlist-context'

type Props = {
  product: { slug: string; name: string; imageUrl: string | null; priceCents: number | null }
  className?: string
}

// Heart toggle — stops propagation so it works inside a card that's itself a
// link (e.g. ProductCard), same pattern as AddToCartButton.
export default function WishlistButton({ product, className = '' }: Props) {
  const { isWishlisted, toggle } = useWishlist()
  const active = isWishlisted(product.slug)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggle({
      productSlug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      priceCents: product.priceCents,
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      aria-pressed={active}
      className={`grid place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:text-red-500 ${
        active ? 'text-red-500' : 'text-neutral-600'
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          d="M12 20.5l-1.3-1.18C6.14 15.24 3.5 12.8 3.5 9.75 3.5 7.4 5.34 5.6 7.65 5.6c1.3 0 2.56.61 3.35 1.57l1 1.2 1-1.2A4.29 4.29 0 0 1 16.35 5.6c2.31 0 4.15 1.8 4.15 4.15 0 3.05-2.64 5.49-7.2 9.58L12 20.5z"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
