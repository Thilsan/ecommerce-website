import { notFound } from 'next/navigation'
import { db } from '@/db'
import { updateProduct } from '@/app/admin/actions'
import ProductForm from '@/app/admin/ProductForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const product = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.id, id),
    with: { variants: true, images: { orderBy: (i, { asc }) => asc(i.sortOrder) } },
  })
  if (!product) notFound()

  const categories = await db.query.categories.findMany()
  const boundUpdate = updateProduct.bind(null, product.id)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit product</h1>
      <p className="mt-1 text-sm text-neutral-600">Update details and variants.</p>
      <div className="mt-8">
        <ProductForm
          action={boundUpdate}
          categories={categories}
          submitLabel="Save changes"
          initial={{
            name: product.name,
            description: product.description ?? '',
            imageUrl: product.imageUrl ?? '',
            categoryId: product.categoryId,
            isNewArrival: product.isNewArrival,
            isBestSeller: product.isBestSeller,
            images: product.images.map((i) => ({ id: i.id, imageUrl: i.imageUrl })),
            variants: product.variants.map((v) => ({
              id: v.id,
              sku: v.sku,
              name: v.name,
              price: v.priceCents / 100,
              stock: v.stock,
            })),
          }}
        />
      </div>
    </div>
  )
}
