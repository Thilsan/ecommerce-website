import { db } from './index'
import { desc, eq, sql } from 'drizzle-orm'
import { orderItems, productVariants, products } from './schema'
import { minPriceCents, parseVariantName } from '@/lib/format'

// Admin-curated "New arrivals" — products flagged isNewArrival, newest first.
// Tops up with the newest other active products so the section isn't empty
// before the admin has flagged anything.
export async function getNewArrivals(limit = 8) {
  const flagged = await db.query.products.findMany({
    where: (p, { and, eq }) => and(eq(p.isActive, true), eq(p.isNewArrival, true)),
    with: { variants: true },
    orderBy: (p, { desc }) => desc(p.createdAt),
    limit,
  })

  if (flagged.length >= limit) return flagged

  const have = new Set(flagged.map((p) => p.id))
  const fillers = await db.query.products.findMany({
    where: (p, { eq }) => eq(p.isActive, true),
    with: { variants: true },
    orderBy: (p, { desc }) => desc(p.createdAt),
  })
  const result = [...flagged]
  for (const p of fillers) {
    if (result.length >= limit) break
    if (!have.has(p.id)) {
      result.push(p)
      have.add(p.id)
    }
  }

  return result
}

// Admin-curated "Best sellers" — products flagged isBestSeller take priority;
// short of `limit`, top up by actual sales (total quantity ordered), then by
// newest, so the section is never empty.
export async function getBestSellers(limit = 4) {
  const flagged = await db.query.products.findMany({
    where: (p, { and, eq }) => and(eq(p.isActive, true), eq(p.isBestSeller, true)),
    with: { variants: true },
    orderBy: (p, { desc }) => desc(p.createdAt),
    limit,
  })

  const bestSellers = [...flagged]
  const have = new Set(flagged.map((p) => p.id))

  if (bestSellers.length < limit) {
    const ranked = await db
      .select({ productId: productVariants.productId })
      .from(orderItems)
      .innerJoin(productVariants, eq(orderItems.variantId, productVariants.id))
      .groupBy(productVariants.productId)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(limit)

    const rankedIds = ranked.map((r) => r.productId).filter((id) => !have.has(id))

    const rankedProducts = rankedIds.length
      ? await db.query.products.findMany({
          where: (p, { and, eq, inArray }) =>
            and(eq(p.isActive, true), inArray(p.id, rankedIds)),
          with: { variants: true },
        })
      : []

    // findMany doesn't preserve the ranked order — reorder to match sales.
    rankedProducts.sort((a, b) => rankedIds.indexOf(a.id) - rankedIds.indexOf(b.id))
    for (const p of rankedProducts) {
      if (bestSellers.length >= limit) break
      bestSellers.push(p)
      have.add(p.id)
    }
  }

  if (bestSellers.length < limit) {
    const fillers = await db.query.products.findMany({
      where: (p, { eq }) => eq(p.isActive, true),
      with: { variants: true },
      orderBy: (p, { desc }) => desc(p.createdAt),
    })
    for (const p of fillers) {
      if (bestSellers.length >= limit) break
      if (!have.has(p.id)) {
        bestSellers.push(p)
        have.add(p.id)
      }
    }
  }

  return bestSellers.slice(0, limit)
}

// Active homepage hero slides, in admin-defined order.
export async function getActiveBanners() {
  return db.query.banners.findMany({
    where: (b, { eq }) => eq(b.isActive, true),
    orderBy: (b, { asc }) => asc(b.sortOrder),
  })
}

// All categories, alphabetical, with a count of active products in each —
// used for the listing page's filter sidebar. The count ignores any other
// filter selection (color, size, price) so it reads as "total in category",
// same as a typical storefront facet.
export async function getCategoriesWithCounts() {
  const cats = await db.query.categories.findMany({
    orderBy: (c, { asc }) => asc(c.name),
  })
  const rows = await db
    .select({ categoryId: products.categoryId, count: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.isActive, true))
    .groupBy(products.categoryId)
  const counts = new Map(rows.map((r) => [r.categoryId, r.count]))
  return cats.map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }))
}

// Categories, alphabetical — used where counts aren't needed.
export async function getCategories() {
  return db.query.categories.findMany({
    orderBy: (c, { asc }) => asc(c.name),
  })
}

// Color/size facet options (with counts) for the listing page's filter
// sidebar, scoped to the selected categories (if any) but ignoring any
// selected color/size/price so the sidebar always shows every option
// reachable from the current category selection, not just the current results.
export async function getFacetOptions(opts: { category?: string[] } = {}) {
  const { category } = opts

  let categoryIds: string[] | undefined
  if (category && category.length > 0) {
    const cats = await db.query.categories.findMany({
      where: (c, { inArray }) => inArray(c.slug, category),
    })
    categoryIds = cats.map((c) => c.id)
    if (categoryIds.length === 0) return { colors: [], sizes: [] }
  }

  const scoped = await db.query.products.findMany({
    where: (p, { and, eq, inArray }) => {
      const conditions = [eq(p.isActive, true)]
      if (categoryIds) conditions.push(inArray(p.categoryId, categoryIds))
      return and(...conditions)
    },
    with: { variants: true },
  })

  const colorCounts = new Map<string, number>()
  const sizeCounts = new Map<string, number>()
  for (const p of scoped) {
    const colors = new Set<string>()
    const sizes = new Set<string>()
    for (const v of p.variants) {
      const { size, color } = parseVariantName(v.name)
      if (color) colors.add(color)
      if (size) sizes.add(size)
    }
    for (const c of colors) colorCounts.set(c, (colorCounts.get(c) ?? 0) + 1)
    for (const s of sizes) sizeCounts.set(s, (sizeCounts.get(s) ?? 0) + 1)
  }

  const toSortedList = (counts: Map<string, number>) =>
    [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  return { colors: toSortedList(colorCounts), sizes: toSortedList(sizeCounts) }
}

// Active products for the listing page, optionally filtered by category
// slugs, colors, sizes, a price range, a free-text search term, and sorted.
// Price sorts run in JS because the sort key (cheapest variant) lives on the
// variants relation, which the DB query can't order by directly.
export type ProductSort = 'newest' | 'price-asc' | 'price-desc'

export async function listProducts(
  opts: {
    category?: string[]
    color?: string[]
    size?: string[]
    sort?: ProductSort
    query?: string
    minPriceCents?: number
    maxPriceCents?: number
  } = {},
) {
  const {
    category,
    color,
    size,
    sort = 'newest',
    query,
    minPriceCents: minPrice,
    maxPriceCents: maxPrice,
  } = opts

  // Resolve category slugs to ids up front. Unknown slugs mean the filter
  // matches nothing, so return an empty listing rather than everything.
  let categoryIds: string[] | undefined
  if (category && category.length > 0) {
    const cats = await db.query.categories.findMany({
      where: (c, { inArray }) => inArray(c.slug, category),
    })
    categoryIds = cats.map((c) => c.id)
    if (categoryIds.length === 0) return []
  }

  const searchTerm = query?.trim()
  // Match each word independently (in either name or description) rather than
  // the whole phrase as one substring, so word order/extra words don't matter
  // — "cotton shirt" still finds "Classic Cotton T-Shirt".
  const searchWords = searchTerm ? searchTerm.toLowerCase().split(/\s+/).filter(Boolean) : []

  const products = await db.query.products.findMany({
    where: (p, { and, eq, ilike, or, inArray }) => {
      const conditions = [eq(p.isActive, true)]
      if (categoryIds) conditions.push(inArray(p.categoryId, categoryIds))
      for (const word of searchWords) {
        conditions.push(or(ilike(p.name, `%${word}%`), ilike(p.description, `%${word}%`))!)
      }
      return and(...conditions)
    },
    with: { variants: true },
    orderBy: (p, { desc }) => desc(p.createdAt),
  })

  // Price lives on the variants relation, so the range filter (like the price
  // sort below) has to run in JS rather than as part of the DB query.
  const priceFiltered =
    minPrice === undefined && maxPrice === undefined
      ? products
      : products.filter((p) => {
          const price = minPriceCents(p.variants)
          if (price === null) return false
          if (minPrice !== undefined && price < minPrice) return false
          if (maxPrice !== undefined && price > maxPrice) return false
          return true
        })

  // Color/size come from the same free-text variant name field, parsed the
  // same way the sidebar facet counts are built — a product matches if any
  // of its variants has the selected color/size (OR within a facet, AND
  // across facets: pick a color AND a size and it must have both, though not
  // necessarily on the same variant).
  const colorSet = color && color.length > 0 ? new Set(color) : undefined
  const sizeSet = size && size.length > 0 ? new Set(size) : undefined
  const variantFiltered =
    !colorSet && !sizeSet
      ? priceFiltered
      : priceFiltered.filter((p) => {
          const parsed = p.variants.map((v) => parseVariantName(v.name))
          const hasColor = !colorSet || parsed.some((v) => v.color && colorSet.has(v.color))
          const hasSize = !sizeSet || parsed.some((v) => v.size && sizeSet.has(v.size))
          return hasColor && hasSize
        })

  // Rank search results by how well they match, best first — an exact name
  // match should never be buried below a merely-related product. Explicit
  // price sorts intentionally override this (the shopper asked for price
  // order), so relevance only applies to the default "newest" sort.
  if (searchWords.length > 0 && sort === 'newest') {
    const term = searchTerm!.toLowerCase()
    const score = (p: (typeof products)[number]) => {
      const name = p.name.toLowerCase()
      if (name === term) return 3
      if (name.startsWith(term)) return 2
      if (name.includes(term)) return 1
      return 0
    }
    return [...variantFiltered].sort((a, b) => score(b) - score(a))
  }

  if (sort === 'price-asc' || sort === 'price-desc') {
    const dir = sort === 'price-asc' ? 1 : -1
    return [...variantFiltered].sort((a, b) => {
      // Products with no variants have no price — push them to the end.
      const pa = minPriceCents(a.variants) ?? Infinity
      const pb = minPriceCents(b.variants) ?? Infinity
      return (pa - pb) * dir
    })
  }

  return variantFiltered
}

// Categories with a few of their newest active products — used for the nav mega menu.
export async function getCategoriesWithProducts() {
  return db.query.categories.findMany({
    with: {
      products: {
        where: (p, { eq }) => eq(p.isActive, true),
        orderBy: (p, { desc }) => desc(p.createdAt),
        limit: 4,
      },
    },
    orderBy: (c, { asc }) => asc(c.name),
  })
}

// A signed-in customer's own order history, newest first.
export async function getOrdersForUser(userId: string) {
  return db.query.orders.findMany({
    where: (o, { eq }) => eq(o.userId, userId),
    with: { items: true },
    orderBy: (o, { desc }) => desc(o.createdAt),
  })
}

// A single order, scoped to its owning user — null if it doesn't exist or
// belongs to someone else, so callers can 404 rather than leak other orders.
export async function getOrderForUser(orderId: string, userId: string) {
  return db.query.orders.findFirst({
    where: (o, { and, eq }) => and(eq(o.id, orderId), eq(o.userId, userId)),
    with: { items: { with: { variant: { with: { product: true } } } } },
  })
}

// Look up a guest order by its confirmation email + order id — lets a guest
// (no account) check status without needing to sign in. Matches on the id
// prefix shown at checkout, so shoppers don't have to type the full UUID.
// The id filter is done in JS (not SQL) since `id` is a uuid column and
// there's no case where a customer email has enough orders for this to matter.
export async function findGuestOrder(orderIdPrefix: string, email: string) {
  const prefix = orderIdPrefix.trim().toLowerCase()
  const candidates = await db.query.orders.findMany({
    where: (o, { ilike }) => ilike(o.customerEmail, email.trim()),
    with: { items: { with: { variant: { with: { product: true } } } } },
  })
  return candidates.find((o) => o.id.toLowerCase().startsWith(prefix)) ?? null
}

// One product by its URL slug, including variants + category. Null if not found.
export async function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: (p, { eq }) => eq(p.slug, slug),
    with: {
      variants: true,
      category: true,
      images: { orderBy: (i, { asc }) => asc(i.sortOrder) },
    },
  })
}

// "You may also like" — active products from the same category, excluding
// the product itself. Tops up with the newest products if the category is
// thin, so the section is never empty as long as other products exist.
export async function getRelatedProducts(
  product: { id: string; categoryId: string | null },
  limit = 8,
) {
  const related = product.categoryId
    ? await db.query.products.findMany({
        where: (p, { and, eq, ne }) =>
          and(
            eq(p.isActive, true),
            eq(p.categoryId, product.categoryId as string),
            ne(p.id, product.id),
          ),
        with: { variants: true },
        orderBy: (p, { desc }) => desc(p.createdAt),
        limit,
      })
    : []

  if (related.length < limit) {
    const have = new Set([product.id, ...related.map((p) => p.id)])
    const fillers = await db.query.products.findMany({
      where: (p, { eq }) => eq(p.isActive, true),
      with: { variants: true },
      orderBy: (p, { desc }) => desc(p.createdAt),
      limit: limit + have.size,
    })
    for (const p of fillers) {
      if (related.length >= limit) break
      if (!have.has(p.id)) {
        related.push(p)
        have.add(p.id)
      }
    }
  }

  return related.slice(0, limit)
}
