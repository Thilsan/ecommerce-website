import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth-helpers'
import { getOrderForUser } from '@/db/queries'
import { formatPrice } from '@/lib/format'

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-green-50 text-green-700',
  shipped: 'bg-sky-50 text-sky-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  refunded: 'bg-neutral-100 text-neutral-600',
}

export default async function AccountOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { user } = await requireUser()
  const { id } = await params

  const order = await getOrderForUser(id, user.id)
  if (!order) notFound()

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/account" className="text-sm text-neutral-500 hover:underline">
        &larr; Back to my account
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Order <span className="font-mono">#{order.id.slice(0, 8)}</span>
        </h1>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
            statusStyles[order.status] ?? 'bg-neutral-100 text-neutral-600'
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-black/10">
        <div className="border-b border-black/10 px-5 py-4">
          <h2 className="text-sm font-semibold">Items</h2>
        </div>
        <ul className="divide-y divide-black/5 px-5">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-medium">{it.variant.product.name}</p>
                <p className="text-xs text-neutral-500">
                  {it.variant.name} &times; {it.quantity}
                </p>
              </div>
              <span className="font-medium">{formatPrice(it.unitPriceCents * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-black/10 px-5 py-4">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-sm font-semibold">{formatPrice(order.totalCents)}</span>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-black/10 p-5">
        <h2 className="text-sm font-semibold">Shipping to</h2>
        <p className="mt-2 text-sm text-neutral-600">
          {order.customerName}
          <br />
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
      </div>
    </main>
  )
}
