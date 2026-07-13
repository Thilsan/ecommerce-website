import Link from 'next/link'
import Image from 'next/image'
import { getActiveBanners, getBestSellers, getCategories, getNewArrivals } from '@/db/queries'
import ProductCarousel from '@/app/components/ProductCarousel'
import BannerSlider from '@/app/components/BannerSlider'

const perks = [
  { title: 'Free shipping', text: 'On every order over Rs 15,000, delivered to your door.' },
  { title: '30-day returns', text: 'Changed your mind? Send it back, no questions asked.' },
  { title: 'Secure checkout', text: 'Your payment details are encrypted end to end.' },
]

// Main collections to feature, in order. Falls back to the first categories found.
const MAIN_COLLECTIONS = ['women', 'men', 'kids', 'shoes']

export default async function HomePage() {
  const [featured, categories, bestSellers, banners] = await Promise.all([
    getNewArrivals(8),
    getCategories(),
    getBestSellers(4),
    getActiveBanners(),
  ])

  const preferred = MAIN_COLLECTIONS
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is (typeof categories)[number] => Boolean(c))
  const collections = (preferred.length >= 4 ? preferred : categories).slice(0, 4)

  return (
    <main className="flex-1">
      {/* Hero — full-width image slider, admin-managed */}
      {banners.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-8 sm:pb-10">
          <BannerSlider
            slides={banners.map((b) => ({
              src: b.imageUrl,
              alt: b.alt,
              href: b.linkUrl ?? undefined,
            }))}
          />
        </section>
      )}

      {/* Perks */}
      <section>
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-8 text-center sm:grid-cols-3">
          {perks.map((perk) => (
            <div key={perk.title}>
              <span className="mx-auto block h-1.5 w-6 rounded-full bg-brand" />
              <h3 className="mt-4 text-sm font-semibold">{perk.title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{perk.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by collection */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Shop by collection</h2>
            <p className="mt-1 text-sm text-neutral-600">Find your fit across our main collections.</p>
          </div>
          <Link href="/products" className="whitespace-nowrap text-sm font-medium text-brand hover:underline">
            View all &rarr;
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/products?category=${collection.slug}`}
              className="group relative flex aspect-4/5 flex-col justify-end overflow-hidden rounded-2xl bg-neutral-100 p-5 transition hover:shadow-md"
            >
              {collection.imageUrl ? (
                <Image
                  src={collection.imageUrl}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <>
                  {/* decorative accents (fallback when no image) */}
                  <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-neutral-200/70 transition group-hover:scale-110" />
                  <span className="pointer-events-none absolute right-10 top-12 h-10 w-10 rounded-full bg-neutral-200/60" />
                </>
              )}

              {/* legibility gradient behind the label */}
              <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

              <div className="relative">
                <h3 className="text-lg font-semibold tracking-tight text-white drop-shadow-sm">{collection.name}</h3>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-white">
                  Shop now
                  <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true">
                    <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2nd banner — full image, no text */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="overflow-hidden rounded-2xl bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/banner-promo.jpg"
            alt="Shop the new collection"
            className="h-50 w-full object-cover sm:h-65 lg:h-80"
          />
        </div>
      </section>

      {/* New arrivals */}
      <section id="products" className="mx-auto w-full max-w-6xl scroll-mt-10 px-4 pb-16">
        <h2 className="text-xl font-semibold tracking-tight">New arrivals</h2>

        {featured.length === 0 ? (
          <p className="mt-10 text-neutral-500">
            No products yet. Run <code>npm run db:seed</code> to add samples.
          </p>
        ) : (
          <ProductCarousel products={featured} />
        )}
      </section>

      {/* Best sellers */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Best sellers</h2>
          <Link href="/products" className="whitespace-nowrap text-sm font-medium text-brand hover:underline">
            View all &rarr;
          </Link>
        </div>

        {bestSellers.length === 0 ? (
          <p className="mt-10 text-neutral-500">No best sellers yet.</p>
        ) : (
          <ProductCarousel products={bestSellers} />
        )}
      </section>
    </main>
  )
}
