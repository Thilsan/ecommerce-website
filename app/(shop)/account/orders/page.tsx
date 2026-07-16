import { redirect } from 'next/navigation'

// Order history lives inline on the main account page — this route exists
// only because other pages (e.g. the footer) link to /account/orders.
export default function AccountOrdersPage() {
  redirect('/account')
}
