import { db } from '@/db'
import { createProduct } from '@/app/admin/actions'
import ProductForm from '@/app/admin/ProductForm'

export default async function NewProductPage() {
  const categories = await db.query.categories.findMany()

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Add product</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Add product details and one or more variants (size / color / etc.).
      </p>
      <div className="mt-8">
        <ProductForm
          action={createProduct}
          categories={categories}
          submitLabel="Create product"
        />
      </div>
    </div>
  )
}
