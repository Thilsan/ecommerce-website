'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await authClient.signIn.email({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message ?? 'Login failed')
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">My Store</span>
          <span className="rounded bg-sky-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Admin
          </span>
        </div>
        <h1 className="mt-6 text-xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-neutral-600">Manage your store’s products.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      </div>
    </main>
  )
}
