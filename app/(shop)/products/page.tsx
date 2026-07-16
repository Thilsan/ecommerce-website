import type { Metadata } from 'next'
import { getCategoriesWithCounts, getFacetOptions, listProducts, type ProductSort } from '@/db/queries'
import ProductCard from '@/app/components/ProductCard'
import SortSelect from '@/app/components/SortSelect'
import ProductFilterPanel from '@/app/components/ProductFilterPanel'
import Breadcrumbs from '@/app/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'All products — Ganna.LK',
  description: 'Browse the full Ganna.LK collection of everyday essentials.',
}

const SORTS: ProductSort[] = ['newest', 'price-asc', 'price-desc']

function splitParam(value?: string) {
  return value ? value.split(',').filter(Boolean) : undefined
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    color?: string
    size?: string
    sort?: string
    q?: string
    minPrice?: string
    maxPrice?: string
  }>
}) {
  const { category, color, size, sort, q, minPrice, maxPrice } = await searchParams
  const categories = splitParam(category)
  const colors = splitParam(color)
  const sizes = splitParam(size)
  const activeSort: ProductSort =
    sort && (SORTS as string[]).includes(sort) ? (sort as ProductSort) : 'newest'
  const minPriceCents = minPrice ? Number(minPrice) * 100 : undefined
  const maxPriceCents = maxPrice ? Number(maxPrice) * 100 : undefined

  const [categoryOptions, facets, products] = await Promise.all([
    getCategoriesWithCounts(),
    getFacetOptions({ category: categories }),
    listProducts({
      category: categories,
      color: colors,
      size: sizes,
      sort: activeSort,
      query: q,
      minPriceCents,
      maxPriceCents,
    }),
  ])

  const activeCategoryName =
    categories?.length === 1 ? categoryOptions.find((c) => c.slug === categories[0])?.name : undefined

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: activeCategoryName ? '/products' : undefined },
          ...(activeCategoryName ? [{ label: activeCategoryName }] : []),
        ]}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {q ? `Results for "${q}"` : 'All products'}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <SortSelect />
      </div>

      <div className="mt-6">
        <ProductFilterPanel categories={categoryOptions} colors={facets.colors} sizes={facets.sizes}>
          {products.length === 0 ? (
            <p className="mt-16 text-center text-neutral-500">
              {q ? `No products found for "${q}".` : 'No products found. Try different filters.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </ProductFilterPanel>
      </div>
    </main>
  )
}
