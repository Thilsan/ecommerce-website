import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins"
import { db } from "../db"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },   // admin logs in with email + password
  plugins: [admin()],                    // roles, ban, impersonate
  trustedOrigins: [
    "http://localhost:3000",
    "http://192.168.18.47:3000",
  ],
})
