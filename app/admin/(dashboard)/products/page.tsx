import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/db'
import { formatPrice, minPriceCents } from '@/lib/format'
import { deleteProduct } from '@/app/admin/actions'

function StockBadge({ stock }: { stock: number }) {
  const style =
    stock === 0
      ? 'bg-red-50 text-red-700'
      : stock <= 10
        ? 'bg-amber-50 text-amber-700'
        : 'bg-green-50 text-green-700'
  const label = stock === 0 ? 'Out of stock' : `${stock} in stock`
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

function PlacementBadges({ isNewArrival, isBestSeller }: { isNewArrival: boolean; isBestSeller: boolean }) {
  if (!isNewArrival && !isBestSeller) return <span className="text-neutral-400">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {isNewArrival && (
        <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          New arrival
        </span>
      )}
      {isBestSeller && (
        <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
          Best seller
        </span>
      )}
    </div>
  )
}

export default async function ProductsPage() {
  const products = await db.query.products.findMany({
    with: { variants: true, category: true },
    orderBy: (p, { desc }) => desc(p.createdAt),
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {products.length} product{products.length === 1 ? '' : 's'}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
        >
          + Add product
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {products.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-500">
            No products yet.{' '}
            <Link href="/admin/products/new" className="font-medium underline">
              Add your first one
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr className="border-b border-neutral-200">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Variants</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Placement</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => {
                  const from = minPriceCents(p.variants)
                  const stock = p.variants.reduce((sum, v) => sum + v.stock, 0)
                  return (
                    <tr key={p.id} className="transition hover:bg-neutral-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                            {p.imageUrl && (
                              <Image
                                src={p.imageUrl}
                                alt={p.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-neutral-600">
                        {p.category?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-neutral-600">{p.variants.length}</td>
                      <td className="px-5 py-3">
                        {from !== null ? formatPrice(from) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <StockBadge stock={stock} />
                      </td>
                      <td className="px-5 py-3">
                        <PlacementBadges isNewArrival={p.isNewArrival} isBestSeller={p.isBestSeller} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
                          >
                            Edit
                          </Link>
                          <form action={deleteProduct}>
                            <input type="hidden" name="id" value={p.id} />
                            <button
                              type="submit"
                              className="font-medium text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
