'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { authClient } from '@/lib/auth-client'

export type CategoryNav = {
  id: string
  name: string
  slug: string
  products: { id: string; name: string; slug: string }[]
}

// Top-level category items. Hardcoded for now — later these come from the backend.
const NAV_CATEGORIES = [
  { name: 'Women', slug: 'women' },
  { name: 'Men', slug: 'men' },
  { name: 'Kids', slug: 'kids' },
  { name: 'Shoes', slug: 'shoes' },
  { name: 'Cosmetics', slug: 'cosmetics' },
]

// Small chevron that flips when its menu is open.
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Featured promo shown alongside every mega menu.
function MegaPromo({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="hidden w-64 shrink-0 flex-col justify-between rounded-lg bg-neutral-100 p-6 lg:flex">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">New season</p>
        <p className="mt-2 max-w-xs text-lg font-semibold tracking-tight">
          Everyday essentials, thoughtfully made
        </p>
      </div>
      <Link
        href="/products"
        onClick={onNavigate}
        className="mt-4 inline-block w-fit rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition hover:bg-brand/90"
      >
        Shop now
      </Link>
    </div>
  )
}

export default function Header({ categories }: { categories: CategoryNav[] }) {
  // Which mega menu is open: 'shop', a category slug, or null.
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginPending, setLoginPending] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Real category data keyed by slug — feeds each category's mega menu.
  const bySlug = new Map(categories.map((c) => [c.slug, c]))
  const { count, openCart } = useCart()
  const { count: wishlistCount } = useWishlist()
  const router = useRouter()
  const { data: session } = authClient.useSession()

  function toggleAccount() {
    cancelClose()
    setOpenMenu(null)
    setSearchOpen(false)
    setMobileOpen(false)
    setLoginError(null)
    setAccountOpen((v) => !v)
  }

  async function onLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginPending(true)
    try {
      const { error } = await authClient.signIn.email({ email: loginEmail, password: loginPassword })
      if (error) {
        setLoginError(error.message ?? 'Could not log in.')
        return
      }
      setLoginEmail('')
      setLoginPassword('')
      setAccountOpen(false)
      router.refresh()
    } catch {
      setLoginError('Could not reach the server. Please try again.')
    } finally {
      setLoginPending(false)
    }
  }

  async function onSignOut() {
    await authClient.signOut()
    setAccountOpen(false)
    router.push('/')
    router.refresh()
  }

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }
  function openMenuFor(key: string) {
    cancelClose()
    setSearchOpen(false)
    setOpenMenu(key)
  }
  function scheduleClose() {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120)
  }
  function closeMenu() {
    cancelClose()
    setOpenMenu(null)
  }
  function toggleSearch() {
    cancelClose()
    setOpenMenu(null)
    setMobileOpen(false)
    setSearchOpen((v) => !v)
  }

  // Escape closes any open menu.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenMenu(null)
        setMobileOpen(false)
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-white/90 shadow-sm backdrop-blur">
      <nav className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight"
          onMouseEnter={scheduleClose}
        >
          Ganna<span className="text-brand">.LK</span>
        </Link>

        {/* Desktop nav — centered within the header */}
        <ul className="hidden items-center gap-7 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
          {/* Shop — overview of every category */}
          <li onMouseEnter={() => openMenuFor('shop')} onMouseLeave={scheduleClose}>
            <button
              type="button"
              onClick={() => setOpenMenu((v) => (v === 'shop' ? null : 'shop'))}
              aria-expanded={openMenu === 'shop'}
              aria-haspopup="true"
              className="flex items-center gap-1 text-sm text-neutral-700 transition hover:text-brand"
            >
              Shop
              <Chevron open={openMenu === 'shop'} />
            </button>
          </li>

          <li>
            <Link
              href="/#products"
              onMouseEnter={scheduleClose}
              className="whitespace-nowrap text-sm text-neutral-700 transition hover:text-brand"
            >
              New Arrivals
            </Link>
          </li>

          {/* Each category is its own mega menu */}
          {NAV_CATEGORIES.map((category) => (
            <li
              key={category.slug}
              onMouseEnter={() => openMenuFor(category.slug)}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((v) => (v === category.slug ? null : category.slug))
                }
                aria-expanded={openMenu === category.slug}
                aria-haspopup="true"
                className="flex items-center gap-1 text-sm text-neutral-700 transition hover:text-brand"
              >
                {category.name}
                <Chevron open={openMenu === category.slug} />
              </button>
            </li>
          ))}
        </ul>

        {/* Right-side actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search */}
          <button
            type="button"
            onClick={toggleSearch}
            aria-label={searchOpen ? 'Close search' : 'Search'}
            aria-expanded={searchOpen}
            className={`rounded-full p-2 transition hover:bg-black/5 hover:text-brand ${
              searchOpen ? 'bg-black/5 text-brand' : 'text-neutral-700'
            }`}
          >
            {searchOpen ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>

          {/* Account */}
          <div className="relative">
            <button
              type="button"
              onClick={toggleAccount}
              aria-label="Account"
              aria-expanded={accountOpen}
              className={`rounded-full p-2 transition hover:bg-black/5 hover:text-brand ${
                accountOpen ? 'bg-black/5 text-brand' : 'text-neutral-700'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-black/10 bg-white p-2 shadow-lg">
                {session?.user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-medium">{session.user.name || 'Account'}</p>
                      <p className="truncate text-xs text-neutral-500">{session.user.email}</p>
                    </div>
                    <div className="my-1 border-t border-black/10" />
                    <button
                      type="button"
                      onClick={onSignOut}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-neutral-700 transition hover:bg-black/5"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <form onSubmit={onLoginSubmit} className="p-2">
                    {loginError && (
                      <p className="mb-2 rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
                        {loginError}
                      </p>
                    )}
                    <label className="block text-xs font-medium text-neutral-600">Email</label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="mt-1 w-full rounded-md border border-black/15 px-2.5 py-1.5 text-sm"
                    />
                    <label className="mt-2.5 block text-xs font-medium text-neutral-600">Password</label>
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="mt-1 w-full rounded-md border border-black/15 px-2.5 py-1.5 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={loginPending}
                      className="mt-3 block w-full rounded-full bg-brand px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loginPending ? 'Signing in…' : 'Log in'}
                    </button>
                    <p className="mt-3 text-center text-sm text-neutral-500">
                      Don&rsquo;t have an account?{' '}
                      <Link
                        href="/register"
                        onClick={() => setAccountOpen(false)}
                        className="font-medium text-brand hover:underline"
                      >
                        Register
                      </Link>
                    </p>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} item${wishlistCount === 1 ? '' : 's'}` : ''}`}
            className="relative rounded-full p-2 text-neutral-700 transition hover:bg-black/5 hover:text-brand"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path
                d="M12 20.5l-1.3-1.18C6.14 15.24 3.5 12.8 3.5 9.75 3.5 7.4 5.34 5.6 7.65 5.6c1.3 0 2.56.61 3.35 1.57l1 1.2 1-1.2A4.29 4.29 0 0 1 16.35 5.6c2.31 0 4.15 1.8 4.15 4.15 0 3.05-2.64 5.49-7.2 9.58L12 20.5z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Cart${count > 0 ? `, ${count} item${count === 1 ? '' : 's'}` : ''}`}
            className="relative rounded-full p-2 text-neutral-700 transition hover:bg-black/5 hover:text-brand"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M6 7h12l-1 12a2 2 0 0 1-2 1.8H9A2 2 0 0 1 7 19L6 7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false)
              setMobileOpen((v) => !v)
            }}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
            className="md:hidden rounded-full p-2 text-neutral-700 transition hover:bg-black/5"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-full border-b border-black/10 bg-white shadow-sm">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
            <form
              action="/products"
              method="GET"
              className="flex items-center gap-3 rounded-full border border-black/15 bg-neutral-50 px-5 py-3 transition focus-within:border-brand focus-within:bg-white"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-neutral-400" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                name="q"
                autoFocus
                placeholder="Search for products…"
                className="w-full bg-transparent text-base placeholder:text-neutral-400 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition hover:bg-brand/90"
              >
                Search
              </button>
            </form>
            <p className="mt-3 text-center text-xs text-neutral-400">Press Esc to close</p>
          </div>
        </div>
      )}

      {/* Mega menu (desktop) — content depends on which item is open */}
      {openMenu && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute inset-x-0 top-full hidden border-b border-black/10 bg-white shadow-sm md:block"
        >
          <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-8">
            {openMenu === 'shop' ? (
              // Shop: overview grid of every category.
              <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
                {categories.map((category) => (
                  <div key={category.id}>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                      {category.name}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {category.products.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={closeMenu}
                            className="text-sm text-neutral-700 transition hover:text-brand"
                          >
                            {product.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href={`/products?category=${category.slug}`}
                          onClick={closeMenu}
                          className="text-sm font-medium text-brand hover:underline"
                        >
                          View all
                        </Link>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              // A single category: its products + a "shop all" link.
              (() => {
                const cat = bySlug.get(openMenu)
                const name =
                  cat?.name ?? NAV_CATEGORIES.find((c) => c.slug === openMenu)?.name ?? ''
                const products = cat?.products ?? []
                return (
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        {name}
                      </h3>
                      <Link
                        href={`/products?category=${openMenu}`}
                        onClick={closeMenu}
                        className="text-sm font-medium text-brand hover:underline"
                      >
                        Shop all {name} &rarr;
                      </Link>
                    </div>
                    {products.length > 0 ? (
                      <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
                        {products.map((product) => (
                          <li key={product.id}>
                            <Link
                              href={`/products/${product.slug}`}
                              onClick={closeMenu}
                              className="text-sm text-neutral-700 transition hover:text-brand"
                            >
                              {product.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-neutral-500">More styles coming soon.</p>
                    )}
                  </div>
                )
              })()
            )}

            <MegaPromo onNavigate={closeMenu} />
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-black/10 bg-white md:hidden">
          <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
            {categories.map((category) => (
              <div key={category.id}>
                <Link
                  href={`/products?category=${category.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-xs font-semibold uppercase tracking-wide text-neutral-400 transition hover:text-brand"
                >
                  {category.name}
                </Link>
                <ul className="mt-2 space-y-2">
                  {category.products.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm text-neutral-700"
                      >
                        {product.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-brand"
            >
              All products
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
