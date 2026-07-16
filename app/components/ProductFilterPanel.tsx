'use client'

import { useState } from 'react'
import FilterSidebar from './FilterSidebar'

type Option = { name: string; count: number }
type CategoryOption = { slug: string; name: string; count: number }

type Props = {
  categories: CategoryOption[]
  colors: Option[]
  sizes: Option[]
  children: React.ReactNode
}

export default function ProductFilterPanel({ categories, colors, sizes, children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-1.5 text-sm text-neutral-700 transition hover:border-black/20"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M4 6h16M7 12h10M10 18h4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        {open ? 'Hide filter' : 'Filter'}
      </button>

      <div className="flex flex-col gap-8 md:flex-row">
        {open && <FilterSidebar categories={categories} colors={colors} sizes={sizes} />}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
