'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { requireUser } from '@/lib/auth-helpers'

export type AccountFormState = { error?: string; success?: string }

// Change the currently signed-in customer's own password.
export async function changeOwnPassword(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  await requireUser()

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
