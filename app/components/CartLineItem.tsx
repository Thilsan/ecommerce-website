'use client'

import Link from 'next/link'
import { useCart, type CartItem } from '@/lib/cart-context'
import { formatPrice } from '@/lib/format'

export default function CartLineItem({
  item,
  onNavigate,
  imageClassName = 'h-20 w-16',
}: {
  item: CartItem
  onNavigate?: () => void
  imageClassName?: string
}) {
  const { removeItem, updateQuantity } = useCart()

  return (
    <li className="flex gap-3 py-4">
      <div className={`shrink-0 overflow-hidden rounded-md bg-neutral-100 ${imageClassName}`}>
        {item.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/products/${item.productSlug}`}
              onClick={onNavigate}
              className="text-sm font-medium hover:underline"
            >
              {item.name}
            </Link>
            <p className="text-xs text-neutral-500">{item.variantName}</p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            aria-label={`Remove ${item.name} from cart`}
            className="shrink-0 text-xs text-neutral-400 hover:text-red-600"
          >
            Remove
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="inline-flex items-center rounded-full border border-black/15">
            <button
              type="button"
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              aria-label={`Decrease quantity of ${item.name}`}
              className="grid h-7 w-7 place-items-center text-sm text-neutral-600 transition hover:text-brand"
            >
              &minus;
            </button>
            <span className="w-6 text-center text-xs font-medium tabular-nums">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              aria-label={`Increase quantity of ${item.name}`}
              className="grid h-7 w-7 place-items-center text-sm text-neutral-600 transition hover:text-brand"
            >
              +
            </button>
          </div>
          <span className="text-sm font-medium">{formatPrice(item.priceCents * item.quantity)}</span>
        </div>
      </div>
    </li>
  )
}
