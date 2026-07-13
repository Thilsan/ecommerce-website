import Link from 'next/link'
import { formatPrice, minPriceCents } from '@/lib/format'
import ProductImage from './ProductImage'
import AddToCartButton from './AddToCartButton'
import WishlistButton from './WishlistButton'

type Props = {
  product: {
    slug: string
    name: string
    imageUrl: string | null
    variants: { id: string; name: string; priceCents: number; stock: number }[]
  }
}

export default function ProductCard({ product }: Props) {
  const from = minPriceCents(product.variants)
  // Default to the cheapest in-stock variant so "Add to cart" on the card
  // adds something buyable without the shopper picking a variant first.
  const inStock = product.variants.filter((v) => v.stock > 0)
  const defaultVariant =
    inStock.length > 0
      ? inStock.reduce((a, b) => (a.priceCents <= b.priceCents ? a : b))
      : product.variants[0]

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-black/10 transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-neutral-100">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(max-width: 768px) 50vw, 25vw"
          className="transition group-hover:scale-105"
        />
        <WishlistButton
          product={{ slug: product.slug, name: product.name, imageUrl: product.imageUrl, priceCents: from }}
          className="absolute right-2 top-2 h-9 w-9"
        />
        {defaultVariant && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center p-3 opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            <AddToCartButton
              product={product}
              variant={defaultVariant}
              className="w-full justify-center shadow-md"
            />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium">{product.name}</h3>
        <p className="mt-1 text-sm text-neutral-600">
          {from !== null ? formatPrice(from) : 'Unavailable'}
        </p>
      </div>
    </Link>
  )
}
