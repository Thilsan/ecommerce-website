import Link from 'next/link'
import NewsletterForm from './NewsletterForm'

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: '#',
    icon: (
      <path d="M13.5 21v-7.5h2.4l.4-3h-2.8V8.7c0-.87.24-1.46 1.5-1.46H16V4.56c-.28-.04-1.24-.12-2.36-.12-2.34 0-3.94 1.43-3.94 4.04v2.02H7.3v3h2.4V21h3.8z" />
    ),
  },
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="1" />
      </>
    ),
  },
  {
    name: 'TikTok',
    href: '#',
    icon: (
      <path d="M14 3v10.5a2.75 2.75 0 1 1-2-2.65V8.4a5.25 5.25 0 1 0 4.5 5.2V9.9a6.2 6.2 0 0 0 3.5 1.08V8.2a3.6 3.6 0 0 1-2.5-1.1A3.6 3.6 0 0 1 16.5 3H14z" />
    ),
  },
]

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
  { name: 'Track Order', href: '/track-order' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Returns Policy', href: '/returns-policy' },
  { name: 'Terms & Conditions', href: '/terms-conditions' },
]

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 px-4 py-12 sm:grid-cols-3 lg:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Ganna<span className="text-brand">.LK</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-white/60">
            Quality everyday goods, thoughtfully made.
          </p>
          <p className="mt-3 text-sm text-white/60">
            <a href="mailto:hello@ganna.lk" className="transition hover:text-white">
              hello@ganna.lk
            </a>
            <br />
            Colombo, Sri Lanka
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

        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Follow Us</h3>
          <div className="mt-4 flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                aria-label={social.name}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/80 transition hover:border-white/40 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  {social.icon}
                </svg>
              </a>
            ))}
          </div>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-white/80">
            Newsletter Sign Up
          </h3>
          <p className="mt-2 text-sm text-white/60">
            Sign up for exclusive updates, new arrivals &amp; insider only discounts
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
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
