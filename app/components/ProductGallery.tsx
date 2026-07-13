'use client'

import { useState } from 'react'
import ProductImage from './ProductImage'

type Props = {
  images: string[]
  alt: string
}

// Feature image + thumbnail strip. Clicking a thumbnail swaps the main image.
export default function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0)
  const src = images[active] ?? null

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <ProductImage src={src} alt={alt} sizes="(max-width: 768px) 100vw, 50vw" priority />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((imgSrc, i) => (
            <button
              key={imgSrc}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md ring-2 transition ${
                i === active ? 'ring-brand' : 'ring-transparent hover:ring-black/10'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
