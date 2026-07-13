'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type CartItem = {
  variantId: string
  productSlug: string
  name: string
  variantName: string
  priceCents: number
  imageUrl: string | null
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clear: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  hydrated: boolean
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'ganna-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  // Load any previously saved cart once the component mounts in the browser.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // Corrupt or inaccessible storage — start with an empty cart.
    }
    setHydrated(true)
  }, [])

  // Skip the first (pre-hydration) write so an empty initial state doesn't
  // clobber a cart already saved from a previous visit.
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId)
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + quantity } : i,
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }, [])

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId))
  }, [])

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items, count, addItem, removeItem, updateQuantity, clear, isOpen, openCart, closeCart, hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
