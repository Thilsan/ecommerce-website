import Link from 'next/link'
import type { Metadata } from 'next'
import { getCategories, listProducts, type ProductSort } from '@/db/queries'
import ProductCard from '@/app/components/ProductCard'
import SortSelect from '@/app/components/SortSelect'
import Breadcrumbs from '@/app/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'All products — Ganna.LK',
  description: 'Browse the full Ganna.LK collection of everyday essentials.',
}

const SORTS: ProductSort[] = ['newest', 'price-asc', 'price-desc']

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>
}) {
  const { category, sort, q } = await searchParams
  const activeSort: ProductSort =
    sort && (SORTS as string[]).includes(sort) ? (sort as ProductSort) : 'newest'

  const [categories, products] = await Promise.all([
    getCategories(),
    listProducts({ category, sort: activeSort, query: q }),
  ])

  // Build a filter-pill href that preserves the current sort + search term.
  function categoryHref(slug?: string) {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    if (activeSort !== 'newest') params.set('sort', activeSort)
    if (q) params.set('q', q)
    const query = params.toString()
    return query ? `/products?${query}` : '/products'
  }

  const filters = [{ name: 'All', slug: undefined as string | undefined }, ...categories]
  const activeCategory = category ? categories.find((c) => c.slug === category) : undefined

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: activeCategory ? '/products' : undefined },
          ...(activeCategory ? [{ label: activeCategory.name }] : []),
        ]}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {q ? `Results for "${q}"` : 'All products'}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {products.length} {products.length === 1 ? 'item' : 'items'}
            {category ? ' in this category' : ''}
          </p>
        </div>
        <SortSelect />
      </div>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive = (f.slug ?? undefined) === (category ?? undefined)
          return (
            <Link
              key={f.slug ?? 'all'}
              href={categoryHref(f.slug)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                isActive
                  ? 'border-brand bg-brand text-white'
                  : 'border-black/10 text-neutral-700 hover:border-black/20'
              }`}
            >
              {f.name}
            </Link>
          )
        })}
      </div>

      {/* Product grid */}
      {products.length === 0 ? (
        <p className="mt-16 text-center text-neutral-500">
          {q ? `No products found for "${q}".` : 'No products found. Try a different category.'}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}
