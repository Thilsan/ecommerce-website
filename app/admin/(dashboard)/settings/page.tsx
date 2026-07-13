import { getSession } from '@/lib/auth-helpers'
import ChangePasswordForm from '@/app/admin/ChangePasswordForm'

export default async function SettingsPage() {
  const session = await getSession()

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-neutral-500">Manage your account.</p>

      <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-sm font-semibold">Account</h2>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-neutral-500">Name:</dt>
            <dd className="font-medium">{session?.user.name || '—'}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-neutral-500">Email:</dt>
            <dd className="font-medium">{session?.user.email}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-sm font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Enter your current password and a new one.
        </p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  )
}
