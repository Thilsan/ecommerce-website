// Prices are stored as integer cents. Format them for display.
export function formatPrice(cents: number, currency = 'LKR') {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

// Cheapest variant price (in cents) for a product — used for "from Rs X" on cards.
// Lives here (a pure module) so client components can use it without pulling in
// the DB layer.
export function minPriceCents(variants: { priceCents: number }[]) {
  if (variants.length === 0) return null
  return Math.min(...variants.map((v) => v.priceCents))
}

// Variant names follow a "Size / Color" convention (e.g. "M / Black",
// "EU 42 / White") but aren't a structured field — some (e.g. "50ml") don't
// follow it at all. Split on " / " and treat anything else as unfaceted
// rather than guessing which half is which.
export function parseVariantName(name: string) {
  const parts = name.split('/').map((s) => s.trim()).filter(Boolean)
  if (parts.length === 2) return { size: parts[0], color: parts[1] }
  return { size: null as string | null, color: null as string | null }
}
