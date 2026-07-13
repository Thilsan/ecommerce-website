'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function LogoutButton() {
  const router = useRouter()
  return (
    <button
      onClick={async () => {
        await authClient.signOut()
        router.push('/admin/login')
        router.refresh()
      }}
      className="text-sm text-neutral-600 hover:text-black hover:underline"
    >
      Sign out
    </button>
  )
}
