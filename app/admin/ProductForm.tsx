'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import type { FormState } from './actions'

type Category = { id: string; name: string }
type VariantInit = {
  id?: string
  sku?: string
  name?: string
  price?: number
  stock?: number
}
type ExistingImage = { id: string; imageUrl: string }
type Initial = {
  name?: string
  description?: string
  imageUrl?: string
  categoryId?: string | null
  variants?: VariantInit[]
  images?: ExistingImage[]
  isNewArrival?: boolean
  isBestSeller?: boolean
}
type Row = {
  key: string
  id: string
  sku: string
  name: string
  price: string
  stock: string
}

let keyCounter = 0
const nextKey = () => `row-${keyCounter++}`

export default function ProductForm({
  action,
  categories,
  initial = {},
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  categories: Category[]
  initial?: Initial
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const editing = initial.images !== undefined
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(initial.images ?? [])
  // A product with 0 or 1 variants is "simple" — prefill the plain price/stock
  // fields from it, and default the toggle below to simple mode.
  const simple = (initial.variants?.length ?? 0) <= 1 ? initial.variants?.[0] : undefined
  // Explicit toggle rather than inferring the mode from field contents — that
  // used to silently let a stale prefilled variant row win over edits to the
  // plain Price/Stock fields. Only the active section's inputs are rendered,
  // so only one of the two ever reaches the server.
  const [hasVariants, setHasVariants] = useState((initial.variants?.length ?? 0) > 1)
  const [rows, setRows] = useState<Row[]>(() => {
    const init = initial.variants ?? []
    if (init.length <= 1) {
      return [{ key: nextKey(), id: '', sku: '', name: '', price: '', stock: '0' }]
    }
    return init.map((v) => ({
      key: nextKey(),
      id: v.id ?? '',
      sku: v.sku ?? '',
      name: v.name ?? '',
      price: v.price != null ? String(v.price) : '',
      stock: v.stock != null ? String(v.stock) : '0',
    }))
  })

  const set = (key: string, field: keyof Row, value: string) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)))
  const addRow = () =>
    setRows((rs) => [...rs, { key: nextKey(), id: '', sku: '', name: '', price: '', stock: '0' }])
  const removeRow = (key: string) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs))

  const input = 'mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm'
  const label = 'block text-sm font-medium'
  const cell = 'w-full rounded-md border border-black/15 px-2 py-1.5 text-sm'

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label className={label}>Product name</label>
        <input name="name" defaultValue={initial.name} required className={input} />
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea name="description" defaultValue={initial.description} rows={3} className={input} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>{editing ? 'Replace feature image' : 'Feature image'}</label>
          {editing && initial.imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={initial.imageUrl} alt="" className="mt-2 mb-2 h-24 w-24 rounded-md object-cover" />
          )}
          <input type="file" name="image" accept="image/*" className={input} />
          {editing && (
            <p className="mt-1 text-xs text-neutral-500">Leave blank to keep the current image.</p>
          )}
        </div>
        <div>
          <label className={label}>Category</label>
          <select name="categoryId" defaultValue={initial.categoryId ?? ''} className={input}>
            <option value="">— none —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="rounded-lg border border-black/10 p-4">
        <legend className="text-sm font-medium">Homepage placement</legend>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isNewArrival"
              defaultChecked={initial.isNewArrival}
              className="h-4 w-4 rounded border-black/20"
            />
            Show in &ldquo;New arrivals&rdquo;
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isBestSeller"
              defaultChecked={initial.isBestSeller}
              className="h-4 w-4 rounded border-black/20"
            />
            Show in &ldquo;Best sellers&rdquo;
          </label>
        </div>
      </fieldset>

      {/* Thumbnail gallery */}
      <fieldset className="rounded-lg border border-black/10 p-4">
        <legend className="text-sm font-medium">Thumbnail images</legend>

        {existingImages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.imageUrl} alt="" className="h-20 w-20 rounded-md object-cover" />
                <button
                  type="button"
                  onClick={() => setExistingImages((imgs) => imgs.filter((i) => i.id !== img.id))}
                  title="Remove thumbnail"
                  className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-neutral-500 shadow ring-1 ring-black/10 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {/* One hidden input per image the admin removed from the grid above. */}
        {(initial.images ?? [])
          .filter((img) => !existingImages.some((i) => i.id === img.id))
          .map((img) => (
            <input key={img.id} type="hidden" name="removeImageId" value={img.id} />
          ))}

        <input type="file" name="newImages" accept="image/*" multiple className={input} />
        <p className="mt-1 text-xs text-neutral-500">Add one or more additional gallery images.</p>
      </fieldset>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={hasVariants}
          onChange={(e) => setHasVariants(e.target.checked)}
          className="h-4 w-4 rounded border-black/20"
        />
        This product has multiple variants (e.g. size or color)
      </label>

      {!hasVariants && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Price (LKR)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={simple?.price}
              placeholder="0.00"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Stock</label>
            <input
              name="stock"
              type="number"
              min="0"
              required
              defaultValue={simple?.stock ?? 0}
              className={input}
            />
          </div>
        </div>
      )}

      {hasVariants && (
        <fieldset className="rounded-lg border border-black/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <legend className="text-sm font-medium">Variants</legend>
            <button
              type="button"
              onClick={addRow}
              className="rounded-md border border-black/15 px-2.5 py-1 text-xs font-medium hover:bg-black/5"
            >
              + Add variant
            </button>
          </div>

          <div className="space-y-2">
            <div className="hidden grid-cols-[1fr_1fr_90px_70px_28px] gap-2 text-xs font-medium text-neutral-500 sm:grid">
              <span>Name (e.g. M / Black)</span>
              <span>SKU</span>
              <span>Price (LKR)</span>
              <span>Stock</span>
              <span></span>
            </div>

            {rows.map((r) => (
              <div key={r.key} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_90px_70px_28px]">
                {/* carries the existing variant id (empty for new rows) */}
                <input type="hidden" name="variantId" value={r.id} />
                <input
                  name="variantName"
                  value={r.name}
                  onChange={(e) => set(r.key, 'name', e.target.value)}
                  placeholder="Variant name"
                  className={cell}
                />
                <input
                  name="variantSku"
                  value={r.sku}
                  onChange={(e) => set(r.key, 'sku', e.target.value)}
                  placeholder="SKU (auto)"
                  className={cell}
                />
                <input
                  name="variantPrice"
                  value={r.price}
                  onChange={(e) => set(r.key, 'price', e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className={cell}
                />
                <input
                  name="variantStock"
                  value={r.stock}
                  onChange={(e) => set(r.key, 'stock', e.target.value)}
                  type="number"
                  min="0"
                  required
                  className={cell}
                />
                <button
                  type="button"
                  onClick={() => removeRow(r.key)}
                  disabled={rows.length === 1}
                  title="Remove variant"
                  className="rounded-md text-neutral-400 hover:text-red-600 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-60"
        >
          {pending ? 'Saving…' : submitLabel}
        </button>
        <Link href="/admin/products" className="text-sm text-neutral-600 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  )
}
