'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await authClient.signUp.email({ name, email, password })
    setLoading(false)
    if (error) {
      setError(error.message ?? 'Could not create your account.')
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  const input = 'mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm'

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
      <p className="mt-1 text-sm text-neutral-600">Faster checkout next time.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={input}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{' '}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-brand hover:underline"
        >
          Log in
        </Link>
      </p>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
