'use client'

import { useEffect, useRef, useState } from 'react'
import ProductCard from './ProductCard'

// Reuse ProductCard's product shape and add the id we key on.
type CarouselProduct = React.ComponentProps<typeof ProductCard>['product'] & { id: string }

export default function ProductCarousel({ products }: { products: CarouselProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  function update() {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
  }

  // Recompute the arrow states on mount and whenever the product set changes.
  useEffect(() => {
    update()
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [products.length])

  function scrollByPage(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <div className="group relative mt-6">
      {/* Scrollable track — swipe on touch, arrows on desktop */}
      <div
        ref={trackRef}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[calc(50%-12px)] shrink-0 snap-start md:w-[calc(25%-18px)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        disabled={atStart}
        aria-label="Previous products"
        className="absolute -left-3 top-[38%] grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-800 opacity-0 shadow-md backdrop-blur transition hover:bg-white focus-visible:opacity-100 disabled:pointer-events-none disabled:opacity-0 group-hover:opacity-100"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
          <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        disabled={atEnd}
        aria-label="Next products"
        className="absolute -right-3 top-[38%] grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-800 opacity-0 shadow-md backdrop-blur transition hover:bg-white focus-visible:opacity-100 disabled:pointer-events-none disabled:opacity-0 group-hover:opacity-100"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
          <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
