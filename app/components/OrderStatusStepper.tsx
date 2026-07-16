const STATUS_STEPS = ['pending', 'paid', 'shipped', 'delivered']

export default function OrderStatusStepper({ status }: { status: string }) {
  const stepIndex = STATUS_STEPS.indexOf(status)
  if (stepIndex === -1) return null // cancelled / refunded — no linear progress to show

  return (
    <div>
      <div className="flex items-center">
        {STATUS_STEPS.map((step, i) => (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${
                i <= stepIndex ? 'bg-brand text-white' : 'bg-black/10 text-neutral-400'
              }`}
            >
              {i < stepIndex ? '✓' : i + 1}
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 rounded ${i < stepIndex ? 'bg-brand' : 'bg-black/10'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-neutral-500">
        {STATUS_STEPS.map((step) => (
          <span key={step} className="capitalize first:text-left last:text-right">
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}
