import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from './auth'

// Read the current session on the server (reads the Better Auth cookie).
export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

// Guard for admin-only areas. Redirects to login if not an authenticated admin.
export async function requireAdmin() {
  const data = await getSession()
  if (!data || data.user.role !== 'admin') {
    redirect('/admin/login')
  }
  return data
}
