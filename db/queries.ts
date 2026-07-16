import { db } from './index'
import { desc, eq, sql } from 'drizzle-orm'
import { orderItems, productVariants } from './schema'
import { minPriceCents } from '@/lib/format'

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

// All categories, alphabetical — used for the listing page's filter bar.
export async function getCategories() {
  return db.query.categories.findMany({
    orderBy: (c, { asc }) => asc(c.name),
  })
}

// Active products for the listing page, optionally filtered by category slug,
// a free-text search term, and sorted. Price sorts run in JS because the sort
// key (cheapest variant) lives on the variants relation, which the DB query
// can't order by directly.
export type ProductSort = 'newest' | 'price-asc' | 'price-desc'

export async function listProducts(
  opts: { category?: string; sort?: ProductSort; query?: string } = {},
) {
  const { category, sort = 'newest', query } = opts

  // Resolve the category slug to an id up front. An unknown slug means the
  // filter matches nothing, so return an empty listing rather than everything.
  let categoryId: string | undefined
  if (category) {
    const cat = await db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.slug, category),
    })
    if (!cat) return []
    categoryId = cat.id
  }

  const filterId = categoryId
  const searchTerm = query?.trim()
  // Match each word independently (in either name or description) rather than
  // the whole phrase as one substring, so word order/extra words don't matter
  // — "cotton shirt" still finds "Classic Cotton T-Shirt".
  const searchWords = searchTerm ? searchTerm.toLowerCase().split(/\s+/).filter(Boolean) : []

  const products = await db.query.products.findMany({
    where: (p, { and, eq, ilike, or }) => {
      const conditions = [eq(p.isActive, true)]
      if (filterId) conditions.push(eq(p.categoryId, filterId))
      for (const word of searchWords) {
        conditions.push(or(ilike(p.name, `%${word}%`), ilike(p.description, `%${word}%`))!)
      }
      return and(...conditions)
    },
    with: { variants: true },
    orderBy: (p, { desc }) => desc(p.createdAt),
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
    return [...products].sort((a, b) => score(b) - score(a))
  }

  if (sort === 'price-asc' || sort === 'price-desc') {
    const dir = sort === 'price-asc' ? 1 : -1
    return [...products].sort((a, b) => {
      // Products with no variants have no price — push them to the end.
      const pa = minPriceCents(a.variants) ?? Infinity
      const pb = minPriceCents(b.variants) ?? Infinity
      return (pa - pb) * dir
    })
  }

  return products
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
