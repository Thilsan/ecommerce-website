'use client'

import Link from 'next/link'
import { useWishlist } from '@/lib/wishlist-context'
import { formatPrice } from '@/lib/format'

export default function WishlistPage() {
  const { items, remove } = useWishlist()

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-black/10 py-20 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-neutral-100 text-neutral-400">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Your wishlist is empty</h1>
            <p className="mt-1 text-sm text-neutral-500">Save products you like to find them here later.</p>
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
        Your wishlist <span className="text-neutral-400">({items.length})</span>
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.productSlug} className="group relative overflow-hidden rounded-lg border border-black/10">
            <button
              type="button"
              onClick={() => remove(item.productSlug)}
              aria-label={`Remove ${item.name} from wishlist`}
              className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-neutral-600 shadow-sm backdrop-blur transition hover:text-red-500"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L10.94 12l-5.72 5.72a.75.75 0 1 0 1.06 1.06L12 13.06l5.72 5.72a.75.75 0 1 0 1.06-1.06L13.06 12l5.72-5.72a.75.75 0 0 0-1.06-1.06L12 10.94 6.28 5.22Z"
                />
              </svg>
            </button>
            <Link href={`/products/${item.productSlug}`} className="block">
              <div className="relative aspect-square bg-neutral-100">
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium">{item.name}</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {item.priceCents !== null ? formatPrice(item.priceCents) : 'Unavailable'}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}
