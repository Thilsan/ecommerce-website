'use client'

import { useState } from 'react'
import { addAddress } from './actions'
import AddressForm from './AddressForm'

export default function AddAddressSection() {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-black/15 px-5 py-3 text-sm font-medium text-brand transition hover:border-brand/40 hover:bg-brand/5"
      >
        + Add new address
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-black/10 p-4">
      <AddressForm action={addAddress} submitLabel="Add address" onDone={() => setOpen(false)} />
    </div>
  )
}
