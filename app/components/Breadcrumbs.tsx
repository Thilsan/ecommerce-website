import Link from 'next/link'

export type Crumb = { label: string; href?: string }

// Simple text breadcrumb trail. The last item is always rendered as the
// current page (no link, even if a href was passed).
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-neutral-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="text-neutral-300">
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition hover:text-brand">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'max-w-[16rem] truncate font-medium text-neutral-900' : ''}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
