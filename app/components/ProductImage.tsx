'use client'

import Image from 'next/image'
import { useState } from 'react'

type Props = {
  src: string | null
  alt: string
  sizes?: string
  priority?: boolean
  className?: string
}

// Product image with a graceful fallback: shows a neutral placeholder when the
// product has no image, or when the given image fails to load.
export default function ProductImage({
  src,
  alt,
  sizes = '(max-width: 768px) 50vw, 25vw',
  priority,
  className = '',
}: Props) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  if (showImage) {
    return (
      <Image
        src={src as string}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
      />
    )
  }

  // Default placeholder — a clothes-hanger glyph on a neutral field.
  return (
    <div className="absolute inset-0 grid place-items-center bg-neutral-100 text-neutral-300">
      <svg viewBox="0 0 24 24" fill="none" className="h-1/3 w-1/3" aria-hidden="true">
        <circle cx="12" cy="5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M12 6.6c-.7.5-.7 1.4 0 1.8l8.2 4.7c.5.3.8.7.8 1.2 0 .9-.8 1.4-1.8 1.4H4.8C3.8 15.7 3 15.2 3 14.3c0-.5.3-.9.8-1.2L12 8.4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">No image available</span>
    </div>
  )
}
