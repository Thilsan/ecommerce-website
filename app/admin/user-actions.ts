'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/auth-helpers'

export type UserFormState = { error?: string; success?: string }

// Create a new user (optionally an admin). Better Auth's admin plugin also
// enforces that the caller is an admin; requireAdmin() is defense in depth.
export async function createUser(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin()

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const role = formData.get('role') === 'admin' ? 'admin' : 'user'

  if (!email || !password) return { error: 'Email and password are required.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  try {
    await auth.api.createUser({
      body: { email, password, name: name || email, role },
      headers: await headers(),
    })
  } catch (e) {
    return { error: (e as Error).message || 'Could not create user.' }
  }

  revalidatePath('/admin/customers')
  return { success: `Created ${email}${role === 'admin' ? ' (admin)' : ''}.` }
}

export async function setUserRole(formData: FormData): Promise<void> {
  await requireAdmin()
  const userId = String(formData.get('userId') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim()
  if (userId && (role === 'admin' || role === 'user')) {
    await auth.api.setRole({ body: { userId, role }, headers: await headers() })
  }
  revalidatePath('/admin/customers')
}

export async function deleteUser(formData: FormData): Promise<void> {
  await requireAdmin()
  const userId = String(formData.get('userId') ?? '').trim()
  if (userId) {
    await auth.api.removeUser({ body: { userId }, headers: await headers() })
  }
  revalidatePath('/admin/customers')
}

// Change the currently signed-in admin's own password.
export async function changeOwnPassword(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin()

  const currentPassword = String(formData.get('currentPassword') ?? '')
  const newPassword = String(formData.get('newPassword') ?? '')

  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters.' }
  }

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword },
      headers: await headers(),
    })
  } catch {
    return { error: 'Could not change password. Is your current password correct?' }
  }

  return { success: 'Password updated successfully.' }
}
