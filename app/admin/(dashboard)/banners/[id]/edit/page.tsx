import { notFound } from 'next/navigation'
import { db } from '@/db'
import { updateBanner } from '@/app/admin/actions'
import BannerForm from '@/app/admin/BannerForm'

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const banner = await db.query.banners.findFirst({ where: (b, { eq }) => eq(b.id, id) })
  if (!banner) notFound()

  const boundUpdate = updateBanner.bind(null, banner.id)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit banner</h1>
      <p className="mt-1 text-sm text-neutral-600">Update the slide&apos;s image and details.</p>
      <div className="mt-8">
        <BannerForm
          action={boundUpdate}
          submitLabel="Save changes"
          initial={{
            imageUrl: banner.imageUrl,
            alt: banner.alt,
            linkUrl: banner.linkUrl ?? '',
            sortOrder: banner.sortOrder,
            isActive: banner.isActive,
          }}
        />
      </div>
    </div>
  )
}
