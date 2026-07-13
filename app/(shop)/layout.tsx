import { getCategoriesWithProducts } from '@/db/queries'
import AnnouncementBar from '@/app/components/AnnouncementBar'
import Header from '@/app/components/Header'
import CartSidebar from '@/app/components/CartSidebar'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategoriesWithProducts()

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="flex min-h-screen flex-col">
          <AnnouncementBar />
          <Header categories={categories} />
          <CartSidebar />
          {children}
          <footer className="bg-black text-white">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm sm:flex-row">
              <p>
                Ganna<span className="text-brand">.LK</span> — quality everyday goods
              </p>
              <p className="text-white/60">&copy; {new Date().getFullYear()} Ganna.LK. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </WishlistProvider>
    </CartProvider>
  )
}
