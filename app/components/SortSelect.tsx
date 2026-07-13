'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

export default function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('sort') ?? 'newest'

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams)
    if (e.target.value === 'newest') {
      params.delete('sort') // keep the default URL clean
    } else {
      params.set('sort', e.target.value)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <label className="flex items-center gap-2 text-sm text-neutral-600">
      Sort
      <select
        value={current}
        onChange={onChange}
        className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-neutral-800 transition hover:border-black/20 focus:border-brand focus:outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
