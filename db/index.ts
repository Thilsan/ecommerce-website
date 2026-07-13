import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import * as authSchema from '../auth-schema'

// Reuse one connection across hot reloads in dev (avoids exhausting connections)
const globalForDb = globalThis as unknown as { client?: ReturnType<typeof postgres> }

const client = globalForDb.client ?? postgres(process.env.DATABASE_URL!)
if (process.env.NODE_ENV !== 'production') globalForDb.client = client

// Merge app tables + Better Auth tables so both the query API and the
// Better Auth Drizzle adapter can resolve every table.
export const db = drizzle(client, { schema: { ...schema, ...authSchema } })
