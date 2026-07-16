'use server'

import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { addresses } from '@/db/schema'
import { requireUser } from '@/lib/auth-helpers'

export type AccountFormState = { error?: string; success?: string }

/* ---------- saved addresses ---------- */

export async function addAddress(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const { user } = await requireUser()

  const line1 = String(formData.get('line1') ?? '').trim()
  const line2 = String(formData.get('line2') ?? '').trim() || null
  const city = String(formData.get('city') ?? '').trim()
  const postalCode = String(formData.get('postalCode') ?? '').trim()
  const country = String(formData.get('country') ?? '').trim()

  if (!line1 || !city || !postalCode || !country) {
    return { error: 'Address line 1, city, postal code, and country are required.' }
  }

  await db.insert(addresses).values({ userId: user.id, line1, line2, city, postalCode, country })

  revalidatePath('/account')
  return { success: 'Address added.' }
}

export async function updateAddress(
  addressId: string,
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const { user } = await requireUser()

  const line1 = String(formData.get('line1') ?? '').trim()
  const line2 = String(formData.get('line2') ?? '').trim() || null
  const city = String(formData.get('city') ?? '').trim()
  const postalCode = String(formData.get('postalCode') ?? '').trim()
  const country = String(formData.get('country') ?? '').trim()

  if (!line1 || !city || !postalCode || !country) {
    return { error: 'Address line 1, city, postal code, and country are required.' }
  }

  await db
    .update(addresses)
    .set({ line1, line2, city, postalCode, country })
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, user.id)))

  revalidatePath('/account')
  return { success: 'Address updated.' }
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const { user } = await requireUser()
  const addressId = String(formData.get('addressId') ?? '').trim()
  if (addressId) {
    await db
      .delete(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, user.id)))
  }
  revalidatePath('/account')
}

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
