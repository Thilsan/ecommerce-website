import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { auth } from '../lib/auth'
import { db } from './index'
import { user } from '../auth-schema'

// Usage:
//   ADMIN_EMAIL="you@store.com" ADMIN_PASSWORD="yourpassword" npm run db:seed-admin
async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME ?? 'Admin'

  if (!email || !password) {
    console.error(
      'Missing credentials. Run:\n' +
        '  ADMIN_EMAIL="you@store.com" ADMIN_PASSWORD="yourpassword" npm run db:seed-admin',
    )
    process.exit(1)
  }

  // Create the account through Better Auth so the password is hashed correctly.
  try {
    await auth.api.signUpEmail({ body: { email, password, name } })
    console.log('✅ Created user:', email)
  } catch (err) {
    console.log('ℹ️  Sign-up skipped (user may already exist):', (err as Error).message)
  }

  // Promote to admin (admin plugin reads the `role` column).
  await db.update(user).set({ role: 'admin' }).where(eq(user.email, email))
  console.log('✅ Promoted to admin:', email)
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Admin seed failed:', err)
  process.exit(1)
})
