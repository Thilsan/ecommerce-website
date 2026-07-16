'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Option = { name: string; count: number }
type CategoryOption = { slug: string; name: string; count: number }

type Props = {
  categories: CategoryOption[]
  colors: Option[]
  sizes: Option[]
}

const VISIBLE_LIMIT = 8

export default function FilterSidebar({ categories, colors, sizes }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedCategories = new Set(searchParams.get('category')?.split(',').filter(Boolean))
  const selectedColors = new Set(searchParams.get('color')?.split(',').filter(Boolean))
  const selectedSizes = new Set(searchParams.get('size')?.split(',').filter(Boolean))

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')

  function toggle(key: string, value: string, selected: Set<string>) {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else next.add(value)

    const params = new URLSearchParams(searchParams)
    if (next.size > 0) params.set(key, [...next].join(','))
    else params.delete(key)
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  function applyPrice(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (minPrice) params.set('minPrice', minPrice)
    else params.delete('minPrice')
    if (maxPrice) params.set('maxPrice', maxPrice)
    else params.delete('maxPrice')
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <aside className="w-full shrink-0 md:w-64">
      <FacetSection title="Category" defaultOpen>
        <CheckboxList
          options={categories.map((c) => ({ name: c.name, count: c.count, value: c.slug }))}
          selected={selectedCategories}
          onToggle={(value) => toggle('category', value, selectedCategories)}
        />
      </FacetSection>

      <FacetSection title="Color" defaultOpen>
        <CheckboxList
          options={colors.map((c) => ({ name: c.name, count: c.count, value: c.name }))}
          selected={selectedColors}
          onToggle={(value) => toggle('color', value, selectedColors)}
        />
      </FacetSection>

      <FacetSection title="Size" defaultOpen>
        <CheckboxList
          options={sizes.map((s) => ({ name: s.name, count: s.count, value: s.name }))}
          selected={selectedSizes}
          onToggle={(value) => toggle('size', value, selectedSizes)}
        />
      </FacetSection>

      <FacetSection title="Price (Rs)" defaultOpen>
        <form onSubmit={applyPrice} className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full min-w-0 rounded border border-black/10 bg-white px-2 py-1.5 text-sm text-neutral-800 focus:border-brand focus:outline-none"
          />
          <span className="text-neutral-400">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full min-w-0 rounded border border-black/10 bg-white px-2 py-1.5 text-sm text-neutral-800 focus:border-brand focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded border border-black/10 px-3 py-1.5 text-sm text-neutral-700 transition hover:border-black/20"
          >
            Go
          </button>
        </form>
      </FacetSection>
    </aside>
  )
}

function FacetSection({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(!!defaultOpen)

  return (
    <div className="border-b border-black/10 py-4 first:pt-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-medium text-neutral-800"
      >
        {title}
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className={`h-4 w-4 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

function CheckboxList({
  options,
  selected,
  onToggle,
}: {
  options: { name: string; count: number; value: string }[]
  selected: Set<string>
  onToggle: (value: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? options : options.slice(0, VISIBLE_LIMIT)

  if (options.length === 0) {
    return <p className="text-sm text-neutral-400">None available</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {visible.map((o) => (
        <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={selected.has(o.value)}
            onChange={() => onToggle(o.value)}
            className="h-4 w-4 rounded border-black/20 accent-brand"
          />
          <span className="flex-1">{o.name}</span>
          <span className="text-neutral-400">({o.count})</span>
        </label>
      ))}
      {options.length > VISIBLE_LIMIT && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 self-start text-sm font-medium text-brand hover:underline"
        >
          {expanded ? 'View less' : 'View all'}
        </button>
      )}
    </div>
  )
}
