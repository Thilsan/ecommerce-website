import 'dotenv/config'
import { db } from './index'
import {
  categories,
  products,
  productVariants,
  orders,
  orderItems,
  payments,
} from './schema'

async function main() {
  console.log('🌱 Seeding database...')

  // Start clean. Delete orders first (order_items reference variants), then
  // products (cascades to variants), then categories.
  await db.delete(orders) // cascades order_items + payments
  await db.delete(products) // cascades variants
  await db.delete(categories)

  // --- categories ---
  const [women, men, kids, shoes, cosmetics] = await db
    .insert(categories)
    .values([
      { name: 'Women', slug: 'women', imageUrl: '/category-women.jpg' },
      { name: 'Men', slug: 'men', imageUrl: '/category-men.jpg' },
      { name: 'Kids', slug: 'kids', imageUrl: '/category-kids.jpg' },
      { name: 'Shoes', slug: 'shoes', imageUrl: '/category-shoes.jpg' },
      { name: 'Cosmetics', slug: 'cosmetics', imageUrl: '/category-cosmetics.jpg' },
    ])
    .returning()

  // --- products ---
  const [tee, hoodie, sneaker, kidsTee, moisturizer] = await db
    .insert(products)
    .values([
      {
        categoryId: women.id,
        name: 'Classic Cotton T-Shirt',
        slug: 'classic-cotton-t-shirt',
        description: 'Soft 100% cotton tee. Everyday essential.',
        imageUrl: 'https://placehold.co/600x600?text=T-Shirt',
      },
      {
        categoryId: men.id,
        name: 'Pullover Hoodie',
        slug: 'pullover-hoodie',
        description: 'Cozy fleece-lined hoodie for cooler days.',
        imageUrl: 'https://placehold.co/600x600?text=Hoodie',
      },
      {
        categoryId: shoes.id,
        name: 'Everyday Sneaker',
        slug: 'everyday-sneaker',
        description: 'Lightweight sneakers that go with anything.',
        imageUrl: 'https://placehold.co/600x600?text=Sneaker',
      },
      {
        categoryId: kids.id,
        name: 'Kids Graphic Tee',
        slug: 'kids-graphic-tee',
        description: 'Durable, playful print tee sized for kids.',
        imageUrl: 'https://placehold.co/600x600?text=Kids+Tee',
      },
      {
        categoryId: cosmetics.id,
        name: 'Everyday Face Moisturizer',
        slug: 'everyday-face-moisturizer',
        description: 'Lightweight daily moisturizer for all skin types.',
        imageUrl: 'https://placehold.co/600x600?text=Moisturizer',
      },
    ])
    .returning()

  // --- variants (price in cents, plus stock) ---
  const variants = await db
    .insert(productVariants)
    .values([
      { productId: tee.id, sku: 'TEE-S-BLK', name: 'S / Black', priceCents: 1999, stock: 50 },
      { productId: tee.id, sku: 'TEE-M-BLK', name: 'M / Black', priceCents: 1999, stock: 40 },
      { productId: tee.id, sku: 'TEE-L-WHT', name: 'L / White', priceCents: 1999, stock: 30 },

      { productId: hoodie.id, sku: 'HOD-M-GRY', name: 'M / Grey', priceCents: 4999, stock: 25 },
      { productId: hoodie.id, sku: 'HOD-L-GRY', name: 'L / Grey', priceCents: 4999, stock: 20 },

      { productId: sneaker.id, sku: 'SNK-42-WHT', name: 'EU 42 / White', priceCents: 7999, stock: 15 },
      { productId: sneaker.id, sku: 'SNK-43-WHT', name: 'EU 43 / White', priceCents: 7999, stock: 12 },

      { productId: kidsTee.id, sku: 'KID-S-BLU', name: '4-5Y / Blue', priceCents: 1499, stock: 40 },
      { productId: kidsTee.id, sku: 'KID-M-BLU', name: '6-7Y / Blue', priceCents: 1499, stock: 35 },

      { productId: moisturizer.id, sku: 'COS-MOIST-50ML', name: '50ml', priceCents: 2499, stock: 60 },
    ])
    .returning()

  // --- one sample paid order (so the admin Orders page has data) ---
  const teeVariant = variants[1] // M / Black
  const sneakerVariant = variants[5] // EU 42 / White
  const totalCents = teeVariant.priceCents * 2 + sneakerVariant.priceCents * 1

  const [order] = await db
    .insert(orders)
    .values({ status: 'paid', totalCents })
    .returning()

  await db.insert(orderItems).values([
    {
      orderId: order.id,
      variantId: teeVariant.id,
      quantity: 2,
      unitPriceCents: teeVariant.priceCents,
    },
    {
      orderId: order.id,
      variantId: sneakerVariant.id,
      quantity: 1,
      unitPriceCents: sneakerVariant.priceCents,
    },
  ])

  await db.insert(payments).values({
    orderId: order.id,
    provider: 'stripe',
    status: 'succeeded',
    amountCents: totalCents,
  })

  console.log('✅ Seed complete: 5 categories, 5 products, 10 variants, 1 sample order.')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
