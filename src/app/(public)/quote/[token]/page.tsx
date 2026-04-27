'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface QuoteData {
  jobId: string
  jobType: string
  sourceLang: string | null
  targetLang: string | null
  wordCount: number | null
  amount: number
  expiresAt: string
  acceptedAt: string | null
  clientName: string
}

export default function QuotePage() {
  const { token } = useParams<{ token: string }>()
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [error, setError] = useState<'expired' | 'not_found' | 'cancelled' | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    fetch(`/api/quote/${token}`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) { setError(data.error); return }
        setQuote(data)
        if (data.acceptedAt) setAccepted(true)
      })
      .finally(() => setLoading(false))
  }, [token])

  async function handleAccept() {
    setAccepting(true)
    const res = await fetch(`/api/quote/${token}/accept`, { method: 'POST' })
    const data = await res.json()
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl
    } else {
      alert('Something went wrong. Please call us at (213) 385-7781.')
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {error === 'expired' ? 'Quote Expired' : 'Quote Not Found'}
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {error === 'expired'
              ? 'This quote link has expired. Please contact us to request a new quote.'
              : 'This link is no longer valid.'}
          </p>
          <p className="text-sm text-gray-500">
            Call us at <a href="tel:2133857781" className="text-blue-600">(213) 385-7781</a> or email{' '}
            <a href="mailto:info@latranslation.com" className="text-blue-600">info@latranslation.com</a>
          </p>
        </div>
      </div>
    )
  }

  if (!quote) return null

  const serviceLabel = quote.sourceLang && quote.targetLang
    ? `${quote.sourceLang} → ${quote.targetLang}`
    : quote.jobType

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1a1a2e]">L.A. Translation &amp; Interpretation</h1>
          <p className="text-gray-500 text-sm mt-1">Your Quote</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          {accepted ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Quote Accepted</h2>
              <p className="text-gray-500 text-sm">
                Thank you, {quote.clientName}. Your payment has been received and we are processing your order.
                You will receive a confirmation email shortly.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-sm mb-6">Dear {quote.clientName},</p>

              <div className="bg-gray-50 rounded-lg p-5 mb-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-gray-600 text-sm">Service</span>
                  <span className="font-medium text-sm capitalize">{serviceLabel}</span>
                </div>
                {quote.wordCount && (
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-gray-600 text-sm">Word Count</span>
                    <span className="font-medium text-sm">{quote.wordCount.toLocaleString()} words</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#1a1a2e]">{formatCurrency(quote.amount)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mb-6">
                Quote expires {new Date(quote.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              <Button
                className="w-full"
                size="lg"
                onClick={handleAccept}
                disabled={accepting}
              >
                {accepting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to payment…</>
                ) : (
                  `Accept & Pay ${formatCurrency(quote.amount)}`
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Secure payment powered by Stripe
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Questions? Call{' '}
          <a href="tel:2133857781" className="text-blue-500">(213) 385-7781</a>
          {' '}or email{' '}
          <a href="mailto:info@latranslation.com" className="text-blue-500">info@latranslation.com</a>
        </p>
      </div>
    </div>
  )
}
