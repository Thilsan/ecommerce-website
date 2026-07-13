import { createBanner } from '@/app/admin/actions'
import BannerForm from '@/app/admin/BannerForm'

export default function NewBannerPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Add banner</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Add a slide to the homepage hero slider.
      </p>
      <div className="mt-8">
        <BannerForm action={createBanner} submitLabel="Create banner" />
      </div>
    </div>
  )
}
