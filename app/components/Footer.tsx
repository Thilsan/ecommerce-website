import Link from 'next/link'

const SHOP_LINKS = [
  { name: 'Women', slug: 'women' },
  { name: 'Men', slug: 'men' },
  { name: 'Kids', slug: 'kids' },
  { name: 'Shoes', slug: 'shoes' },
  { name: 'Cosmetics', slug: 'cosmetics' },
]

const INFORMATION_LINKS = [
  { name: 'About Us', href: '/about-us' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Delivery', href: '/delivery' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Returns Policy', href: '/returns-policy' },
  { name: 'Terms & Conditions', href: '/terms-conditions' },
]

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Ganna<span className="text-brand">.LK</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-white/60">
            Quality everyday goods, thoughtfully made.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Shop</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {SHOP_LINKS.map((link) => (
              <li key={link.slug}>
                <Link href={`/products?category=${link.slug}`} className="text-white/60 transition hover:text-white">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Information</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {INFORMATION_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/60 transition hover:text-white">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Get in touch</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/60">
            <li>
              <a href="mailto:hello@ganna.lk" className="transition hover:text-white">
                hello@ganna.lk
              </a>
            </li>
            <li>Colombo, Sri Lanka</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm sm:flex-row">
          <p className="text-white/60">&copy; {new Date().getFullYear()} Ganna.LK. All rights reserved.</p>
          <div className="flex items-center gap-4 text-white/60">
            <Link href="/products" className="transition hover:text-white">
              Shop all
            </Link>
            <span className="text-white/20">·</span>
            <Link href="/wishlist" className="transition hover:text-white">
              Wishlist
            </Link>
            <span className="text-white/20">·</span>
            <Link href="/cart" className="transition hover:text-white">
              Cart
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
