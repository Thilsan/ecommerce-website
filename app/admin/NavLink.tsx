'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLink({
  href,
  match,
  exact = false,
  children,
}: {
  href: string
  match?: string // path prefix used for the active check (defaults to href)
  exact?: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const base = match ?? href
  const active = exact ? pathname === base : pathname.startsWith(base)

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? 'bg-sky-500 text-white'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
      }`}
    >
      {children}
    </Link>
  )
}
