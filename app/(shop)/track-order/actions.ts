'use server'

import { findGuestOrder } from '@/db/queries'

export type TrackOrderState = {
  error?: string
  order?: {
    id: string
    status: string
    totalCents: number
    createdAt: Date
    items: { id: string; productName: string; variantName: string; quantity: number; unitPriceCents: number }[]
  }
}

export async function lookupGuestOrder(
  _prev: TrackOrderState,
  formData: FormData,
): Promise<TrackOrderState> {
  const orderId = String(formData.get('orderId') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()

  if (!orderId || !email) {
    return { error: 'Enter your order number and the email used at checkout.' }
  }

  const order = await findGuestOrder(orderId, email)
  if (!order) {
    return { error: "We couldn't find an order with that number and email." }
  }

  return {
    order: {
      id: order.id,
      status: order.status,
      totalCents: order.totalCents,
      createdAt: order.createdAt,
      items: order.items.map((it) => ({
        id: it.id,
        productName: it.variant.product.name,
        variantName: it.variant.name,
        quantity: it.quantity,
        unitPriceCents: it.unitPriceCents,
      })),
    },
  }
}
