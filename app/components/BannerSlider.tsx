'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Slide = {
  src: string
  alt: string
  href?: string
}

type BannerSliderProps = {
  slides: Slide[]
  /** Auto-advance interval in ms. Set to 0 to disable. */
  intervalMs?: number
  className?: string
}

export default function BannerSlider({ slides, intervalMs = 5000, className = '' }: BannerSliderProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length

  const goTo = useCallback((index: number) => setCurrent((index + count) % count), [count])
  const next = useCallback(() => setCurrent((c) => (c + 1) % count), [count])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + count) % count), [count])

  // Auto-advance, paused on hover/focus. Reset the timer whenever the slide changes.
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (count <= 1 || intervalMs <= 0 || paused) return
    timer.current = setInterval(next, intervalMs)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [count, intervalMs, paused, next])

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-neutral-100 ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* Sliding track — height is driven by the slide images */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => {
          const image = (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={slide.src}
              alt={slide.alt}
              className="h-65 w-full object-cover sm:h-90 lg:h-115"
              draggable={false}
            />
          )
          return (
            <div key={slide.src} className="w-full shrink-0" aria-hidden={i !== current}>
              {slide.href ? <a href={slide.href}>{image}</a> : image}
            </div>
          )
        })}
      </div>

      {count > 1 && (
        <>
          {/* Arrows — appear on hover */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-neutral-800 opacity-0 shadow-sm backdrop-blur transition hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-neutral-800 opacity-0 shadow-sm backdrop-blur transition hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === current}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
