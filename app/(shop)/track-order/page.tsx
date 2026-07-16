import TrackOrderForm from './TrackOrderForm'

export default function TrackOrderPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Track your order</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Enter your order number and the email you used at checkout.
      </p>
      <div className="mt-8">
        <TrackOrderForm />
      </div>
    </main>
  )
}
