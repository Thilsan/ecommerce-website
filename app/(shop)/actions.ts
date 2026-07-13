'use server'

import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { orders, orderItems, payments, productVariants } from '@/db/schema'
import { getSession } from '@/lib/auth-helpers'

export type CheckoutState = { error?: string; orderId?: string }

type CartLine = { variantId: string; quantity: number }

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const customerName = String(formData.get('customerName') ?? '').trim()
  const customerEmail = String(formData.get('customerEmail') ?? '').trim()
  const customerPhone = String(formData.get('customerPhone') ?? '').trim()
  const shippingLine1 = String(formData.get('shippingLine1') ?? '').trim()
  const shippingLine2 = String(formData.get('shippingLine2') ?? '').trim() || null
  const shippingCity = String(formData.get('shippingCity') ?? '').trim()
  const shippingPostalCode = String(formData.get('shippingPostalCode') ?? '').trim()
  const shippingCountry = String(formData.get('shippingCountry') ?? '').trim()

  if (!customerName) return { error: 'Name is required.' }
  if (!customerEmail) return { error: 'Email is required.' }
  if (!customerPhone) return { error: 'Phone number is required.' }
  if (!shippingLine1 || !shippingCity || !shippingPostalCode || !shippingCountry) {
    return { error: 'A complete shipping address is required.' }
  }

  let cartLines: CartLine[]
  try {
    cartLines = JSON.parse(String(formData.get('cartItems') ?? '[]'))
  } catch {
    return { error: 'Your cart data is invalid — please refresh and try again.' }
  }
  if (!Array.isArray(cartLines) || cartLines.length === 0) {
    return { error: 'Your cart is empty.' }
  }
  for (const line of cartLines) {
    if (typeof line.variantId !== 'string' || !Number.isInteger(line.quantity) || line.quantity < 1) {
      return { error: 'Your cart data is invalid — please refresh and try again.' }
    }
  }

  // Never trust client-supplied prices/stock — re-check both against the DB.
  const variantIds = cartLines.map((l) => l.variantId)
  const variants = await db.query.productVariants.findMany({
    where: (v, { inArray }) => inArray(v.id, variantIds),
  })
  const variantById = new Map(variants.map((v) => [v.id, v]))

  for (const line of cartLines) {
    const variant = variantById.get(line.variantId)
    if (!variant) return { error: 'One or more items in your cart are no longer available.' }
    if (line.quantity > variant.stock) {
      return { error: `Only ${variant.stock} left of "${variant.name}" — please update your cart.` }
    }
  }

  const totalCents = cartLines.reduce((sum, line) => {
    const variant = variantById.get(line.variantId)!
    return sum + variant.priceCents * line.quantity
  }, 0)

  const session = await getSession()

  const orderId = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        userId: session?.user?.id ?? null,
        status: 'pending',
        totalCents,
        customerName,
        customerEmail,
        customerPhone,
        shippingLine1,
        shippingLine2,
        shippingCity,
        shippingPostalCode,
        shippingCountry,
      })
      .returning()

    await tx.insert(orderItems).values(
      cartLines.map((line) => ({
        orderId: order.id,
        variantId: line.variantId,
        quantity: line.quantity,
        unitPriceCents: variantById.get(line.variantId)!.priceCents,
      })),
    )

    await tx.insert(payments).values({
      orderId: order.id,
      provider: 'cod',
      status: 'pending',
      amountCents: totalCents,
    })

    for (const line of cartLines) {
      await tx
        .update(productVariants)
        .set({ stock: sql`${productVariants.stock} - ${line.quantity}` })
        .where(eq(productVariants.id, line.variantId))
    }

    return order.id
  })

  return { orderId }
}
