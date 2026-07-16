import {
  pgTable, pgEnum, uuid, text, integer, boolean,
  timestamp, unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { user } from '../auth-schema' // Better Auth owns the user table (single source of truth)

/* ---------- enums ---------- */
export const orderStatus = pgEnum('order_status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'])
export const paymentStatus = pgEnum('payment_status', ['pending', 'succeeded', 'failed', 'refunded'])

/* ---------- catalog ---------- */
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Homepage hero slider slides, admin-managed.
export const banners = pgTable('banners', {
  id: uuid('id').primaryKey().defaultRandom(),
  imageUrl: text('image_url').notNull(),
  alt: text('alt').notNull(),
  linkUrl: text('link_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').notNull().default(true),
  // Admin-curated placement — which homepage sections a product shows up in.
  isNewArrival: boolean('is_new_arrival').notNull().default(false),
  isBestSeller: boolean('is_best_seller').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Extra gallery/thumbnail images for a product, beyond its main imageUrl.
export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

// Every purchasable thing is a variant (size/color). Price + stock live here.
export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),          // e.g. "M / Black"
  priceCents: integer('price_cents').notNull(),  // money as integer cents — never floats
  stock: integer('stock').notNull().default(0),
})

/* ---------- newsletter ---------- */
export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

/* ---------- addresses (belong to a Better Auth user) ---------- */
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  line1: text('line1').notNull(),
  line2: text('line2'),
  city: text('city').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
})

/* ---------- cart ---------- */
export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  variantId: uuid('variant_id').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
}, (t) => [unique().on(t.cartId, t.variantId)])  // one row per variant per cart

/* ---------- orders & payments ---------- */
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  status: orderStatus('status').notNull().default('pending'),
  totalCents: integer('total_cents').notNull(),
  shippingAddressId: uuid('shipping_address_id').references(() => addresses.id),
  // Guest checkout has no account/saved address to attach, so contact +
  // shipping details are captured inline on the order itself.
  customerName: text('customer_name'),
  customerEmail: text('customer_email'),
  customerPhone: text('customer_phone'),
  shippingLine1: text('shipping_line1'),
  shippingLine2: text('shipping_line2'),
  shippingCity: text('shipping_city'),
  shippingPostalCode: text('shipping_postal_code'),
  shippingCountry: text('shipping_country'),
  deliveryPersonName: text('delivery_person_name'),
  deliveryPersonPhone: text('delivery_person_phone'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Snapshot price at purchase time — product price may change later.
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  variantId: uuid('variant_id').notNull().references(() => productVariants.id),
  quantity: integer('quantity').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
})

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull().default('stripe'),
  providerRef: text('provider_ref'),        // Stripe payment intent / session id
  status: paymentStatus('status').notNull().default('pending'),
  amountCents: integer('amount_cents').notNull(),
})

/* ---------- relations (for Drizzle's query API) ---------- */
export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))
export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  images: many(productImages),
}))
export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}))
export const variantRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}))
export const orderRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  payment: one(payments),
}))
export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}))
export const paymentRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}))
