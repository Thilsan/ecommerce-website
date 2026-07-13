import { db } from '@/db'
import { createCategory } from '@/app/admin/actions'
import CategoryForm from '@/app/admin/CategoryForm'
import CategoryRow from '@/app/admin/CategoryRow'

export default async function CategoriesPage() {
  const categories = await db.query.categories.findMany({
    with: { products: true },
    orderBy: (c, { asc }) => asc(c.name),
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Group products so shoppers can browse by type.
      </p>

      <div className="mt-6 max-w-md">
        <CategoryForm action={createCategory} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {categories.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-500">
            No categories yet. Add one above.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {categories.map((c) => (
              <CategoryRow
                key={c.id}
                category={{
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                  productCount: c.products.length,
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
