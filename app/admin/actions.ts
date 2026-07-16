'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { products, productVariants, productImages, categories, orders, banners } from '@/db/schema'
import { requireAdmin } from '@/lib/auth-helpers'
import { saveUploadedImage, deleteUploadedImage } from '@/lib/upload'

export type FormState = { error?: string; ok?: boolean }

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

type ParsedVariant = {
  id: string | null
  sku: string
  name: string
  priceCents: number
  stock: number
}

// Parse product base fields, variants, feature image and gallery thumbnails.
// `existingImageUrl` is kept when no new feature image file is chosen (edit
// without replacing it). `existingVariants` lets a simple (no explicit
// variant rows) edit update the product's one existing variant in place
// instead of deleting and recreating it.
async function parseProduct(
  formData: FormData,
  existingImageUrl: string | null = null,
  existingVariants: { id: string; sku: string }[] = [],
) {
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null
  const categoryId = String(formData.get('categoryId') ?? '').trim() || null
  const isNewArrival = formData.get('isNewArrival') === 'on'
  const isBestSeller = formData.get('isBestSeller') === 'on'

  if (!name) return { error: 'Name is required.' as const }
  const slug = slugify(name)

  const ids = formData.getAll('variantId').map(String)
  const skus = formData.getAll('variantSku').map((v) => String(v).trim())
  const names = formData.getAll('variantName').map((v) => String(v).trim())
  const prices = formData.getAll('variantPrice').map(String)
  const stocks = formData.getAll('variantStock').map(String)

  // The form only renders (and submits) variant-row fields when the admin
  // has checked "this product has multiple variants" — so no variant fields
  // present means a simple product. The blank-price skip below is just a
  // defensive backstop, not the primary way this is decided.
  const explicitVariants: ParsedVariant[] = []
  for (let i = 0; i < skus.length; i++) {
    if (String(prices[i] ?? '').trim() === '') continue
    const price = Number(prices[i])
    const stock = Number(stocks[i])
    if (!Number.isFinite(price) || price < 0)
      return { error: `Variant ${i + 1}: enter a valid price.` as const }
    if (!Number.isInteger(stock) || stock < 0)
      return { error: `Variant ${i + 1}: enter a valid stock quantity.` as const }
    explicitVariants.push({
      id: ids[i] || null,
      sku: skus[i] || `${slug}-${explicitVariants.length + 1}`.toUpperCase(),
      name: names[i] || 'Default',
      priceCents: Math.round(price * 100),
      stock,
    })
  }

  let variants: ParsedVariant[]
  if (explicitVariants.length > 0) {
    variants = explicitVariants
  } else {
    // No variant rows filled in — treat this as a simple, single-price product.
    const price = Number(formData.get('price'))
    const stock = Number(formData.get('stock'))
    if (!Number.isFinite(price) || price < 0) return { error: 'Enter a valid price.' as const }
    if (!Number.isInteger(stock) || stock < 0) return { error: 'Enter a valid stock quantity.' as const }
    const fallback = existingVariants[0]
    variants = [{
      id: fallback?.id ?? null,
      sku: fallback?.sku ?? slug.toUpperCase(),
      name: 'Default',
      priceCents: Math.round(price * 100),
      stock,
    }]
  }

  const featureFile = formData.get('image')
  let imageUrl = existingImageUrl
  if (featureFile instanceof File && featureFile.size > 0) {
    if (!featureFile.type.startsWith('image/')) return { error: 'Feature image must be an image file.' as const }
    imageUrl = await saveUploadedImage(featureFile)
  }

  const thumbnailFiles = formData.getAll('newImages').filter(
    (f): f is File => f instanceof File && f.size > 0,
  )
  for (const f of thumbnailFiles) {
    if (!f.type.startsWith('image/')) return { error: 'Thumbnail images must be image files.' as const }
  }
  const newImageUrls = await Promise.all(thumbnailFiles.map(saveUploadedImage))

  const removeImageIds = formData.getAll('removeImageId').map(String)

  return {
    data: {
      name,
      slug,
      description,
      imageUrl,
      categoryId,
      isNewArrival,
      isBestSeller,
      variants,
      newImageUrls,
      removeImageIds,
    },
  }
}

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()

  const parsed = await parseProduct(formData)
  if ('error' in parsed) return { error: parsed.error }
  const d = parsed.data

  try {
    const [product] = await db
      .insert(products)
      .values({
        name: d.name,
        slug: d.slug,
        description: d.description,
        imageUrl: d.imageUrl,
        categoryId: d.categoryId,
        isNewArrival: d.isNewArrival,
        isBestSeller: d.isBestSeller,
      })
      .returning()

    await db.insert(productVariants).values(
      d.variants.map((v) => ({
        productId: product.id,
        sku: v.sku,
        name: v.name,
        priceCents: v.priceCents,
        stock: v.stock,
      })),
    )

    if (d.newImageUrls.length) {
      await db.insert(productImages).values(
        d.newImageUrls.map((imageUrl, i) => ({ productId: product.id, imageUrl, sortOrder: i })),
      )
    }
  } catch (err) {
    console.error('createProduct failed:', err)
    return { error: 'Could not create product (duplicate name/slug or SKU?).' }
  }

  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/')
  redirect('/admin/products')
}

export async function updateProduct(
  productId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin()

  const existingProduct = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.id, productId),
    with: { variants: true },
  })
  if (!existingProduct) return { error: 'Product not found.' }

  const parsed = await parseProduct(formData, existingProduct.imageUrl, existingProduct.variants)
  if ('error' in parsed) return { error: parsed.error }
  const d = parsed.data

  let removedImages: { imageUrl: string }[] = []
  try {
    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          name: d.name,
          slug: d.slug,
          description: d.description,
          imageUrl: d.imageUrl,
          categoryId: d.categoryId,
          isNewArrival: d.isNewArrival,
          isBestSeller: d.isBestSeller,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))

      // Reconcile variants: delete removed, update existing, insert new.
      const existing = await tx
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.productId, productId))

      const keepIds = new Set(d.variants.map((v) => v.id).filter(Boolean) as string[])
      const toDelete = existing.filter((e) => !keepIds.has(e.id)).map((e) => e.id)
      if (toDelete.length) {
        await tx.delete(productVariants).where(inArray(productVariants.id, toDelete))
      }

      for (const v of d.variants) {
        if (v.id) {
          await tx
            .update(productVariants)
            .set({ sku: v.sku, name: v.name, priceCents: v.priceCents, stock: v.stock })
            .where(eq(productVariants.id, v.id))
        } else {
          await tx.insert(productVariants).values({
            productId,
            sku: v.sku,
            name: v.name,
            priceCents: v.priceCents,
            stock: v.stock,
          })
        }
      }

      // Gallery thumbnails: remove the ones the admin unchecked, add new uploads.
      if (d.removeImageIds.length) {
        removedImages = await tx
          .delete(productImages)
          .where(inArray(productImages.id, d.removeImageIds))
          .returning({ imageUrl: productImages.imageUrl })
      }
      if (d.newImageUrls.length) {
        const remaining = await tx
          .select({ id: productImages.id })
          .from(productImages)
          .where(eq(productImages.productId, productId))
        await tx.insert(productImages).values(
          d.newImageUrls.map((imageUrl, i) => ({ productId, imageUrl, sortOrder: remaining.length + i })),
        )
      }
    })
  } catch (err) {
    console.error('updateProduct failed:', err)
    return { error: 'Could not update product (duplicate name/slug or SKU?).' }
  }

  if (d.imageUrl !== existingProduct.imageUrl) await deleteUploadedImage(existingProduct.imageUrl)
  await Promise.all(removedImages.map((img) => deleteUploadedImage(img.imageUrl)))

  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath(`/products/${d.slug}`)
  redirect('/admin/products')
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '').trim()
  if (id) {
    const existing = await db.query.products.findFirst({
      where: (p, { eq }) => eq(p.id, id),
      with: { images: true },
    })
    await db.delete(products).where(eq(products.id, id)) // variants + images cascade
    if (existing) {
      await deleteUploadedImage(existing.imageUrl)
      await Promise.all(existing.images.map((img) => deleteUploadedImage(img.imageUrl)))
    }
  }
  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/')
}

/* ---------- categories ---------- */

export async function createCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return { error: 'Category name is required.' }
  try {
    await db.insert(categories).values({ name, slug: slugify(name) })
  } catch {
    return { error: 'Could not create category (duplicate name?).' }
  }
  revalidatePath('/admin/categories')
  return {}
}

export async function updateCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  if (!id) return { error: 'Missing category.' }
  if (!name) return { error: 'Name is required.' }
  try {
    await db.update(categories).set({ name, slug: slugify(name) }).where(eq(categories.id, id))
  } catch {
    return { error: 'Could not rename (duplicate name?).' }
  }
  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
  return { ok: true }
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '').trim()
  if (id) {
    await db.delete(categories).where(eq(categories.id, id)) // products set null
  }
  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
}

/* ---------- banners ---------- */

// Parse banner fields from the form. `existingImageUrl` is kept when no new
// file is chosen (edit without replacing the image).
async function parseBanner(formData: FormData, existingImageUrl: string | null = null) {
  const alt = String(formData.get('alt') ?? '').trim()
  const linkUrl = String(formData.get('linkUrl') ?? '').trim() || null
  const sortOrder = Number(formData.get('sortOrder') ?? 0)
  const isActive = formData.get('isActive') === 'on'
  const file = formData.get('image')

  if (!alt) return { error: 'Alt text is required.' as const }
  if (!Number.isFinite(sortOrder)) return { error: 'Sort order must be a number.' as const }

  let imageUrl = existingImageUrl
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith('image/')) return { error: 'File must be an image.' as const }
    imageUrl = await saveUploadedImage(file)
  }
  if (!imageUrl) return { error: 'An image is required.' as const }

  return { data: { imageUrl, alt, linkUrl, sortOrder, isActive } }
}

export async function createBanner(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const parsed = await parseBanner(formData)
  if ('error' in parsed) return { error: parsed.error }

  await db.insert(banners).values(parsed.data)

  revalidatePath('/admin/banners')
  revalidatePath('/')
  redirect('/admin/banners')
}

export async function updateBanner(
  bannerId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin()

  const existing = await db.query.banners.findFirst({ where: (b, { eq }) => eq(b.id, bannerId) })
  if (!existing) return { error: 'Banner not found.' }

  const parsed = await parseBanner(formData, existing.imageUrl)
  if ('error' in parsed) return { error: parsed.error }
  const d = parsed.data

  await db.update(banners).set(d).where(eq(banners.id, bannerId))
  if (d.imageUrl !== existing.imageUrl) await deleteUploadedImage(existing.imageUrl)

  revalidatePath('/admin/banners')
  revalidatePath('/')
  redirect('/admin/banners')
}

export async function deleteBanner(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '').trim()
  if (id) {
    const existing = await db.query.banners.findFirst({ where: (b, { eq }) => eq(b.id, id) })
    await db.delete(banners).where(eq(banners.id, id))
    if (existing) await deleteUploadedImage(existing.imageUrl)
  }
  revalidatePath('/admin/banners')
  revalidatePath('/')
}

/* ---------- orders ---------- */

const ORDER_STATUSES = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const
type OrderStatus = (typeof ORDER_STATUSES)[number]

export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin()
  const orderId = String(formData.get('orderId') ?? '').trim()
  const status = String(formData.get('status') ?? '').trim()
  if (orderId && (ORDER_STATUSES as readonly string[]).includes(status)) {
    await db.update(orders).set({ status: status as OrderStatus }).where(eq(orders.id, orderId))
  }
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin')
}

export async function assignDelivery(formData: FormData): Promise<void> {
  await requireAdmin()
  const orderId = String(formData.get('orderId') ?? '').trim()
  const name = String(formData.get('deliveryPersonName') ?? '').trim()
  const phone = String(formData.get('deliveryPersonPhone') ?? '').trim()
  if (orderId) {
    await db
      .update(orders)
      .set({ deliveryPersonName: name || null, deliveryPersonPhone: phone || null })
      .where(eq(orders.id, orderId))
  }
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
}
