'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react'

interface QuoteData {
  jobId: string
  jobType: string
  sourceLang: string | null
  targetLang: string | null
  wordCount: number | null
  baseAmount: number
  discountAmount: number | null
  discountLabel: string | null
  amount: number
  expiresAt: string
  acceptedAt: string | null
  clientName: string
}

interface ExpiredData {
  jobId?: string
  jobType?: string
  sourceLang?: string
  targetLang?: string
  clientName?: string
  clientEmail?: string
}

export default function QuotePage() {
  const { token } = useParams<{ token: string }>()
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [errorType, setErrorType] = useState<'expired' | 'not_found' | 'cancelled' | 'invalid' | null>(null)
  const [expiredData, setExpiredData] = useState<ExpiredData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [acceptError, setAcceptError] = useState<string | null>(null)

  // Re-request state
  const [reRequestEmail, setReRequestEmail] = useState('')
  const [reRequestMessage, setReRequestMessage] = useState('')
  const [reRequestSending, setReRequestSending] = useState(false)
  const [reRequestSent, setReRequestSent] = useState(false)

  useEffect(() => {
    fetch(`/api/quote/${token}`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) {
          setErrorType(data.error)
          if (data.error === 'expired') {
            setExpiredData({
              jobId: data.jobId,
              jobType: data.jobType,
              sourceLang: data.sourceLang,
              targetLang: data.targetLang,
              clientName: data.clientName,
              clientEmail: data.clientEmail,
            })
            if (data.clientEmail) setReRequestEmail(data.clientEmail)
          }
          return
        }
        setQuote(data)
        // Treat as accepted if Stripe checkout was created OR if payment was manually recorded
        if (data.acceptedAt || data.status === 'paid' || data.status === 'ai_translating' || data.status === 'ai_review_pending' || data.status === 'assigned' || data.status === 'in_progress' || data.status === 'delivered' || data.status === 'complete') setAccepted(true)
      })
      .finally(() => setLoading(false))
  }, [token])

  async function handleAccept() {
    setAccepting(true)
    setAcceptError(null)
    try {
      const res = await fetch(`/api/quote/${token}/accept`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      setAcceptError(data.error ?? 'Something went wrong. Please call us at (213) 385-7781.')
    } catch {
      setAcceptError('Network error. Please try again or call (213) 385-7781.')
    }
    setAccepting(false)
  }

  async function handleReRequest(e: React.FormEvent) {
    e.preventDefault()
    setReRequestSending(true)
    await fetch('/api/quote/request-new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: reRequestEmail,
        jobId: expiredData?.jobId,
        message: reRequestMessage || undefined,
      }),
    })
    setReRequestSending(false)
    setReRequestSent(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (errorType) {
    const isExpired = errorType === 'expired'
    const isCancelled = errorType === 'cancelled'

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            {isExpired
              ? <Clock className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              : <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            }
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {isExpired ? 'Quote Expired'
                : isCancelled ? 'Quote Cancelled'
                : errorType === 'not_found' ? 'Quote Not Found'
                : 'Link Not Valid'}
            </h1>
            <p className="text-gray-500 text-sm mb-4">
              {isExpired
                ? 'This quote link is no longer active. Request a new quote below and our team will follow up promptly.'
                : isCancelled
                ? 'This quote has been cancelled. Please contact us if you believe this is an error.'
                : errorType === 'not_found'
                ? 'This quote could not be found. It may have been cancelled or the link may be incorrect.'
                : 'This link is not valid. Please use the link from your quote email, or contact us for a new quote.'}
            </p>
            <p className="text-sm text-gray-500">
              Call <a href="tel:2133857781" className="text-blue-600">(213) 385-7781</a>
              {' '}or email{' '}
              <a href="mailto:info@latranslation.com" className="text-blue-600">info@latranslation.com</a>
            </p>
          </div>

          {/* Re-request form — shown for expired and invalid */}
          {(isExpired || errorType === 'invalid') && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {reRequestSent ? (
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <p className="font-medium text-gray-900 text-sm">Request sent.</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Our team will prepare a new quote and email it to you shortly.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="font-semibold text-gray-900 mb-1 text-sm">Request a New Quote</h2>
                  <p className="text-xs text-gray-400 mb-4">
                    Enter your email and we will send you a fresh quote link.
                  </p>
                  <form onSubmit={handleReRequest} className="space-y-3">
                    <Input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={reRequestEmail}
                      onChange={(e) => setReRequestEmail(e.target.value)}
                    />
                    <Input
                      placeholder="Optional message to our team"
                      value={reRequestMessage}
                      onChange={(e) => setReRequestMessage(e.target.value)}
                      maxLength={500}
                    />
                    <Button type="submit" className="w-full" disabled={reRequestSending}>
                      {reRequestSending
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                        : 'Send Request'}
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}
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

              <div className="bg-gray-50 rounded-lg p-5 mb-6 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 text-sm">Service</span>
                  <span className="font-medium text-sm capitalize">{serviceLabel}</span>
                </div>
                {quote.wordCount ? (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm">Word Count</span>
                    <span className="font-medium text-sm">{quote.wordCount.toLocaleString()} words</span>
                  </div>
                ) : null}
                {quote.discountAmount != null && quote.discountAmount > 0 && (
                  <>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 text-sm">Subtotal</span>
                      <span className="font-medium text-sm">{formatCurrency(quote.baseAmount)}</span>
                    </div>
                    <div className="flex justify-between items-start text-green-700">
                      <span className="text-sm">{quote.discountLabel || 'Discount'}</span>
                      <span className="font-medium text-sm">−{formatCurrency(quote.discountAmount)}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#1a1a2e]">{formatCurrency(quote.amount)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mb-6">
                Quote expires {new Date(quote.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              {acceptError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">
                  {acceptError}
                </div>
              )}

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

              <p className="text-xs text-gray-400 text-center mt-3 border-t border-gray-100 pt-3">
                <strong className="text-gray-500">Cancellation policy:</strong> Cancellations within
                48 business hours are subject to the full quoted fee. No refunds within this window.
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
