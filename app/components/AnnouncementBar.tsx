'use client'

import { useState } from 'react'

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div className="relative bg-brand text-white">
      <p className="mx-auto w-full max-w-6xl px-10 py-2 text-center text-xs font-medium tracking-wide sm:text-sm">
        Free shipping on orders over Rs 15,000 — new arrivals just dropped
      </p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/80 transition hover:text-white"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
