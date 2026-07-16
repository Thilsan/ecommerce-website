import Link from 'next/link'
import { requireUser } from '@/lib/auth-helpers'
import { getOrdersForUser } from '@/db/queries'
import { formatPrice } from '@/lib/format'
import ChangePasswordForm from './ChangePasswordForm'

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-green-50 text-green-700',
  shipped: 'bg-sky-50 text-sky-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  refunded: 'bg-neutral-100 text-neutral-600',
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function AccountPage() {
  const { user } = await requireUser()
  const orders = await getOrdersForUser(user.id)

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">My account</h1>

      <section className="mt-8 rounded-xl border border-black/10 p-6">
        <h2 className="text-sm font-semibold">Profile</h2>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-neutral-500">Name:</dt>
            <dd className="font-medium">{user.name || '—'}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-neutral-500">Email:</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl border border-black/10 p-6">
        <h2 className="text-sm font-semibold">Order history</h2>
        {orders.length === 0 ? (
          <div className="mt-4 rounded-lg bg-neutral-50 py-8 text-center">
            <p className="text-sm text-neutral-600">You haven&rsquo;t placed any orders yet.</p>
            <Link
              href="/products"
              className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
            >
              Start shopping &rarr;
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-black/5">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="font-mono text-sm text-brand hover:underline"
                  >
                    #{order.id.slice(0, 8)}
                  </Link>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {formatDate(order.createdAt)} &middot; {order.items.length} item
                    {order.items.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      statusStyles[order.status] ?? 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold">{formatPrice(order.totalCents)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-black/10 p-6">
        <h2 className="text-sm font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-neutral-500">Enter your current password and a new one.</p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </section>
    </main>
  )
}
