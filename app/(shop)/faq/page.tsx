const FAQS = [
  {
    question: 'How long does delivery take?',
    answer: 'Most orders arrive within 2-5 business days depending on your location. See our Delivery page for details.',
  },
  {
    question: 'What is your returns policy?',
    answer: 'We accept returns within 14 days of delivery for unused items in original packaging. See our Returns Policy page for details.',
  },
  {
    question: 'How do I track my order?',
    answer: 'Use the Track Order page with your order number and the email you used at checkout.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept major cards and cash on delivery, shown at checkout.',
  },
]

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h1>
      <p className="mt-1 text-sm text-neutral-600">Answers to common questions about ordering and delivery.</p>

      <dl className="mt-8 divide-y divide-neutral-200">
        {FAQS.map((faq) => (
          <div key={faq.question} className="py-5">
            <dt className="font-medium text-neutral-900">{faq.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-neutral-700">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </main>
  )
}
