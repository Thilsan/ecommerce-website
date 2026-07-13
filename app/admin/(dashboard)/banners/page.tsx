import Link from 'next/link'
import { db } from '@/db'
import { deleteBanner } from '@/app/admin/actions'

export default async function BannersPage() {
  const banners = await db.query.banners.findMany({
    orderBy: (b, { asc }) => asc(b.sortOrder),
  })

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Banners</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage the homepage hero slider images.
          </p>
        </div>
        <Link
          href="/admin/banners/new"
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
        >
          Add banner
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {banners.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-500">
            No banners yet. Add one above.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {banners.map((banner) => (
              <li key={banner.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl}
                    alt=""
                    className="h-12 w-20 shrink-0 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-medium">{banner.alt}</p>
                    <p className="text-xs text-neutral-500">
                      Order {banner.sortOrder} ·{' '}
                      {banner.isActive ? (
                        <span className="text-emerald-600">Active</span>
                      ) : (
                        <span className="text-neutral-400">Hidden</span>
                      )}
                      {banner.linkUrl && <> · links to <span className="font-mono">{banner.linkUrl}</span></>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/admin/banners/${banner.id}/edit`}
                    className="font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
                  >
                    Edit
                  </Link>
                  <form action={deleteBanner}>
                    <input type="hidden" name="id" value={banner.id} />
                    <button type="submit" className="font-medium text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
