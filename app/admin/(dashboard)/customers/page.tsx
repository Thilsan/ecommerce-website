import { db } from '@/db'
import { getSession } from '@/lib/auth-helpers'
import CreateUserForm from '@/app/admin/CreateUserForm'
import { setUserRole, deleteUser } from '@/app/admin/user-actions'

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function CustomersPage() {
  const [users, session] = await Promise.all([
    db.query.user.findMany({ orderBy: (u, { desc }) => desc(u.createdAt) }),
    getSession(),
  ])
  const currentUserId = session?.user.id

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Customers &amp; users</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {users.length} user{users.length === 1 ? '' : 's'}. Create staff admins or manage roles.
      </p>

      <div className="mt-6">
        <CreateUserForm />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr className="border-b border-neutral-200">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((u) => {
                const isSelf = u.id === currentUserId
                const isAdmin = u.role === 'admin'
                return (
                  <tr key={u.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700">
                          {(u.name || u.email).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {u.name || '—'}
                            {isSelf && (
                              <span className="ml-2 text-xs font-normal text-neutral-400">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-neutral-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          isAdmin
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {isAdmin ? 'admin' : 'customer'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-neutral-600">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-4">
                        {isSelf ? (
                          <span className="text-xs text-neutral-400">—</span>
                        ) : (
                          <>
                            <form action={setUserRole}>
                              <input type="hidden" name="userId" value={u.id} />
                              <input
                                type="hidden"
                                name="role"
                                value={isAdmin ? 'user' : 'admin'}
                              />
                              <button
                                type="submit"
                                className="font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
                              >
                                {isAdmin ? 'Revoke admin' : 'Make admin'}
                              </button>
                            </form>
                            <form action={deleteUser}>
                              <input type="hidden" name="userId" value={u.id} />
                              <button
                                type="submit"
                                className="font-medium text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </form>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
