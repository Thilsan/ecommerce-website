'use server'

import { db } from '@/db'
import { newsletterSubscribers } from '@/db/schema'

export type NewsletterState = { error?: string; success?: string }

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { error: 'Enter an email address.' }

  try {
    await db.insert(newsletterSubscribers).values({ email })
  } catch {
    // Unique violation just means they're already subscribed — treat as success.
  }

  return { success: "You're subscribed!" }
}
