'use client'

import { useState } from 'react'
import { updateAddress, deleteAddress } from './actions'
import AddressForm from './AddressForm'

type Address = {
  id: string
  line1: string
  line2: string | null
  city: string
  postalCode: string
  country: string
}

export default function AddressRow({ address }: { address: Address }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className="px-5 py-4">
        <AddressForm
          action={(prev, formData) => updateAddress(address.id, prev, formData)}
          initial={address}
          submitLabel="Save"
          onDone={() => setEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
      <p className="text-neutral-700">
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.postalCode},{' '}
        {address.country}
      </p>
      <div className="flex shrink-0 items-center gap-4">
        <button
          onClick={() => setEditing(true)}
          className="font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
        >
          Edit
        </button>
        <form action={deleteAddress}>
          <input type="hidden" name="addressId" value={address.id} />
          <button type="submit" className="font-medium text-red-600 hover:underline">
            Delete
          </button>
        </form>
      </div>
    </li>
  )
}
