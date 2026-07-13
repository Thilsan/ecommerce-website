import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/db/queries'
import ProductGallery from '@/app/components/ProductGallery'
import ProductDetails from '@/app/components/ProductDetails'
import ProductCarousel from '@/app/components/ProductCarousel'
import Breadcrumbs from '@/app/components/Breadcrumbs'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: `${product.name} — Ganna.LK`,
    description: product.description ?? undefined,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const related = await getRelatedProducts(product)

  const galleryImages = [product.imageUrl, ...product.images.map((i) => i.imageUrl)].filter(
    (src): src is string => Boolean(src),
  )

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          ...(product.category
            ? [{ label: product.category.name, href: `/products?category=${product.category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <ProductGallery images={galleryImages} alt={product.name} />

        <ProductDetails
          slug={product.slug}
          name={product.name}
          categoryName={product.category?.name}
          description={product.description}
          imageUrl={product.imageUrl}
          variants={product.variants}
        />
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-semibold tracking-tight">You may also like</h2>
          <ProductCarousel products={related} />
        </section>
      )}
    </main>
  )
}
