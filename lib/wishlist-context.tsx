'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type WishlistItem = {
  productSlug: string
  name: string
  imageUrl: string | null
  priceCents: number | null
}

type WishlistContextValue = {
  items: WishlistItem[]
  count: number
  isWishlisted: (productSlug: string) => boolean
  toggle: (item: WishlistItem) => void
  remove: (productSlug: string) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)
const STORAGE_KEY = 'ganna-wishlist'

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load any previously saved wishlist once the component mounts in the browser.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // Corrupt or inaccessible storage — start with an empty wishlist.
    }
    setHydrated(true)
  }, [])

  // Skip the first (pre-hydration) write so an empty initial state doesn't
  // clobber a wishlist already saved from a previous visit.
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const isWishlisted = useCallback(
    (productSlug: string) => items.some((i) => i.productSlug === productSlug),
    [items],
  )

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((i) => i.productSlug === item.productSlug)
        ? prev.filter((i) => i.productSlug !== item.productSlug)
        : [...prev, item],
    )
  }, [])

  const remove = useCallback((productSlug: string) => {
    setItems((prev) => prev.filter((i) => i.productSlug !== productSlug))
  }, [])

  return (
    <WishlistContext.Provider
      value={{ items, count: items.length, isWishlisted, toggle, remove }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider')
  return ctx
}
