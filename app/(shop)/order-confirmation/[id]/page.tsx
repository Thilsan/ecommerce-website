import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { formatPrice } from '@/lib/format'

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await db.query.orders.findFirst({
    where: (o, { eq }) => eq(o.id, id),
    with: { items: { with: { variant: { with: { product: true } } } } },
  })
  if (!order) notFound()

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <div className="rounded-xl border border-black/10 p-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand/10 text-brand">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Order placed — thank you!</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Order <span className="font-mono">#{order.id.slice(0, 8)}</span> is confirmed for cash on
          delivery. We&apos;ll be in touch at {order.customerEmail} with shipping updates.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-black/10">
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

      <Link href="/products" className="mt-8 inline-block text-sm font-medium text-brand hover:underline">
        Continue shopping &rarr;
      </Link>
    </main>
  )
}
