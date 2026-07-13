import Link from 'next/link'
import { db } from '@/db'
import { formatPrice } from '@/lib/format'

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-green-50 text-green-700',
  shipped: 'bg-sky-50 text-sky-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  refunded: 'bg-neutral-100 text-neutral-600',
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function OrdersPage() {
  const allOrders = await db.query.orders.findMany({
    with: { items: true },
    orderBy: (o, { desc }) => desc(o.createdAt),
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {allOrders.length} order{allOrders.length === 1 ? '' : 's'}
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {allOrders.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-neutral-700">No orders yet</p>
            <p className="mt-1 text-sm text-neutral-500">
              Orders will appear here once customers check out.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr className="border-b border-neutral-200">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {allOrders.map((o) => (
                  <tr key={o.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono text-xs text-sky-600 hover:underline"
                      >
                        #{o.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-neutral-600">
                      {o.customerName ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-neutral-600">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-neutral-600">{o.items.length}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          statusStyles[o.status] ?? 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium">
                      {formatPrice(o.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
