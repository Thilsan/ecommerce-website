import { getCategoriesWithProducts } from '@/db/queries'
import AnnouncementBar from '@/app/components/AnnouncementBar'
import Header from '@/app/components/Header'
import CartSidebar from '@/app/components/CartSidebar'
import Footer from '@/app/components/Footer'
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
          <Footer />
        </div>
      </WishlistProvider>
    </CartProvider>
  )
}
