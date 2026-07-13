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
