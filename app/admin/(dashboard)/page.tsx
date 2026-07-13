import Link from 'next/link'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { products, productVariants, orders } from '@/db/schema'
import { user } from '@/auth-schema'
import { formatPrice } from '@/lib/format'

function StatCard({
  label,
  value,
  href,
}: {
  label: string
  value: string | number
  href?: string
}) {
  const inner = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </>
  )
  const cls =
    'block rounded-xl border border-neutral-200 bg-white p-5 transition'
  return href ? (
    <Link href={href} className={`${cls} hover:border-neutral-300 hover:shadow-sm`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

export default async function DashboardOverview() {
  // Run the summary queries in parallel.
  const [productCount, variantAgg, orderAgg, customerCount, lowStock, recentOrders] =
    await Promise.all([
      db.$count(products),
      db
        .select({
          units: sql<number>`coalesce(sum(${productVariants.stock}), 0)`,
          outOfStock: sql<number>`count(*) filter (where ${productVariants.stock} = 0)`,
        })
        .from(productVariants),
      db
        .select({
          count: sql<number>`count(*)`,
          revenue: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.status} <> 'cancelled'), 0)`,
        })
        .from(orders),
      db.$count(user),
      db.query.productVariants.findMany({
        where: (v, { lte }) => lte(v.stock, 10),
        with: { product: true },
        orderBy: (v, { asc }) => asc(v.stock),
        limit: 5,
      }),
      db.query.orders.findMany({
        orderBy: (o, { desc }) => desc(o.createdAt),
        limit: 5,
      }),
    ])

  const units = Number(variantAgg[0]?.units ?? 0)
  const outOfStock = Number(variantAgg[0]?.outOfStock ?? 0)
  const orderCount = Number(orderAgg[0]?.count ?? 0)
  const revenue = Number(orderAgg[0]?.revenue ?? 0)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Overview of your store.</p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Revenue" value={formatPrice(revenue)} href="/admin/orders" />
        <StatCard label="Orders" value={orderCount} href="/admin/orders" />
        <StatCard label="Products" value={productCount} href="/admin/products" />
        <StatCard label="Customers" value={customerCount} href="/admin/customers" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Low stock */}
        <section className="rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="text-sm font-semibold">Low stock</h2>
            <span className="text-xs text-neutral-500">{outOfStock} out of stock</span>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-500">
              Everything is well stocked. 🎉
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{v.product.name}</p>
                    <p className="truncate text-xs text-neutral-500">{v.name}</p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      v.stock === 0
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {v.stock === 0 ? 'Out of stock' : `${v.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent orders */}
        <section className="rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-sky-600 hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-500">
              No orders yet.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="font-mono text-xs text-neutral-500">
                    #{o.id.slice(0, 8)}
                  </span>
                  <span className="capitalize text-neutral-600">{o.status}</span>
                  <span className="font-medium">{formatPrice(o.totalCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
