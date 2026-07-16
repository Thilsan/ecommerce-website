import Link from 'next/link'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { user } from '@/auth-schema'
import { formatPrice } from '@/lib/format'
import OrderStatusStepper from '@/app/components/OrderStatusStepper'
import { updateOrderStatus, assignDelivery } from '@/app/admin/actions'

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded']

function formatDate(d: Date) {
  return new Date(d).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await db.query.orders.findFirst({
    where: (o, { eq }) => eq(o.id, id),
    with: {
      items: { with: { variant: { with: { product: true } } } },
      payment: true,
    },
  })
  if (!order) notFound()

  const customer = order.userId
    ? await db.query.user.findFirst({ where: eq(user.id, order.userId) })
    : null

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-neutral-500 hover:underline">
        ← Back to orders
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Order <span className="font-mono text-lg text-neutral-500">#{order.id.slice(0, 8)}</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500">{formatDate(order.createdAt)}</p>
        </div>

        {/* Update status */}
        <form action={updateOrderStatus} className="flex items-center gap-2">
          <input type="hidden" name="orderId" value={order.id} />
          <select
            name="status"
            defaultValue={order.status}
            className="rounded-md border border-black/15 px-3 py-2 text-sm capitalize"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-sky-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
          >
            Update
          </button>
        </form>
      </div>

      <div className="mt-6 max-w-md rounded-xl border border-neutral-200 bg-white p-5">
        <OrderStatusStepper status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <section className="lg:col-span-2 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-sm font-semibold">Items</h2>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-neutral-100">
              {order.items.map((it) => (
                <tr key={it.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium">{it.variant.product.name}</p>
                    <p className="text-xs text-neutral-500">{it.variant.name}</p>
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    {formatPrice(it.unitPriceCents)} × {it.quantity}
                  </td>
                  <td className="px-5 py-3 text-right font-medium">
                    {formatPrice(it.unitPriceCents * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200">
                <td className="px-5 py-3 font-semibold" colSpan={2}>
                  Total
                </td>
                <td className="px-5 py-3 text-right font-semibold">
                  {formatPrice(order.totalCents)}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* Customer + payment */}
        <aside className="space-y-6">
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold">Customer</h2>
            {customer ? (
              <div className="mt-2 text-sm">
                <p className="font-medium">{customer.name || '—'}</p>
                <p className="text-neutral-500">{customer.email}</p>
              </div>
            ) : order.customerName ? (
              <div className="mt-2 text-sm">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-neutral-500">{order.customerEmail}</p>
                <p className="text-neutral-500">{order.customerPhone}</p>
                <p className="mt-1 text-xs text-neutral-400">Guest checkout</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-neutral-500">Guest checkout</p>
            )}
          </section>

          {order.shippingLine1 && (
            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold">Shipping address</h2>
              <p className="mt-2 text-sm text-neutral-600">
                {order.shippingLine1}
                {order.shippingLine2 && (
                  <>
                    <br />
                    {order.shippingLine2}
                  </>
                )}
                <br />
                {order.shippingCity}, {order.shippingPostalCode}
                <br />
                {order.shippingCountry}
              </p>
            </section>
          )}

          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold">Delivery team</h2>
            <form action={assignDelivery} className="mt-2 space-y-2">
              <input type="hidden" name="orderId" value={order.id} />
              <input
                name="deliveryPersonName"
                defaultValue={order.deliveryPersonName ?? ''}
                placeholder="Rider name"
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
              />
              <input
                name="deliveryPersonPhone"
                defaultValue={order.deliveryPersonPhone ?? ''}
                placeholder="Rider phone"
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-full rounded-md bg-sky-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
              >
                Save assignment
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold">Payment</h2>
            {order.payment ? (
              <div className="mt-2 space-y-1 text-sm">
                <p className="capitalize">
                  <span className="text-neutral-500">Status:</span> {order.payment.status}
                </p>
                <p>
                  <span className="text-neutral-500">Provider:</span> {order.payment.provider}
                </p>
                <p>
                  <span className="text-neutral-500">Amount:</span>{' '}
                  {formatPrice(order.payment.amountCents)}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-neutral-500">No payment recorded.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
