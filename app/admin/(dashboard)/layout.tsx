import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-helpers'
import LogoutButton from '@/app/admin/LogoutButton'
import NavLink from '@/app/admin/NavLink'

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}
const icons = {
  grid: <Icon><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></Icon>,
  box: <Icon><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.3 7 12 12l8.7-5M12 22V12" /></Icon>,
  tag: <Icon><path d="M12 2H2v10l9.3 9.3a1 1 0 0 0 1.4 0l8.6-8.6a1 1 0 0 0 0-1.4z" /><circle cx="7" cy="7" r="1" /></Icon>,
  orders: <Icon><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></Icon>,
  users: <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Icon>,
  settings: <Icon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon>,
  store: <Icon><path d="M3 9l1-5h16l1 5M4 9v11h16V9M9 20v-6h6v6" /></Icon>,
  image: <Icon><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></Icon>,
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await requireAdmin()
  const initials = (user.name || user.email).slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-neutral-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-neutral-200 px-6">
          <span className="text-base font-semibold tracking-tight">My Store</span>
          <span className="rounded bg-sky-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <NavLink href="/admin" exact>{icons.grid}Dashboard</NavLink>
          <NavLink href="/admin/products" match="/admin/products">{icons.box}Products</NavLink>
          <NavLink href="/admin/categories">{icons.tag}Categories</NavLink>
          <NavLink href="/admin/banners">{icons.image}Banners</NavLink>
          <NavLink href="/admin/orders">{icons.orders}Orders</NavLink>
          <NavLink href="/admin/customers">{icons.users}Customers</NavLink>
          <NavLink href="/admin/settings">{icons.settings}Settings</NavLink>

          <div className="my-3 border-t border-neutral-200" />

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            {icons.store}View store
          </Link>
        </nav>

        <div className="border-t border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name || 'Admin'}</p>
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            </div>
          </div>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="pl-64">
        <main className="mx-auto max-w-5xl px-8 py-10">{children}</main>
      </div>
    </div>
  )
}
