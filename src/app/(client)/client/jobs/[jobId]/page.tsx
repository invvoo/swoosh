'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { JobProgressBar } from '@/components/job-progress-bar'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface JobDetail {
  id: string; job_type: string; status: string; source_lang: string | null
  target_lang: string | null; word_count: number | null; quote_amount: number | null
  quote_adjusted_amount: number | null; quote_rush_days: number | null
  invoice_number: string | null; created_at: string; scheduled_at: string | null
  delivered_at: string | null; estimated_turnaround_days: number | null
  requested_delivery_date: string | null; document_name: string | null
  delivery_token: string | null
}

const STATUS_MESSAGES: Record<string, string> = {
  draft: 'Your request has been received. We\'ll send you a quote shortly.',
  quote_sent: 'Your quote is ready. Check your email for the quote link to review and accept.',
  quote_accepted: 'You\'ve accepted the quote. Awaiting payment confirmation.',
  paid: 'Payment confirmed. We\'re starting work on your order.',
  ai_translating: 'Your document is being translated by our AI system.',
  ai_review_pending: 'AI draft complete. A professional translator is reviewing and refining.',
  assigned: 'A translator has been assigned and is working on your document.',
  in_progress: 'Your translation is in progress.',
  delivered: 'Your translation has been delivered! Check your email for the download link.',
  complete: 'Your order is complete.',
  confirmed: 'Your interpretation request is confirmed.',
  completed: 'Your appointment is complete.',
  dispatched: 'Equipment has been dispatched to your location.',
  returned: 'Equipment has been returned. We\'re processing your deposit.',
  scheduled: 'Your appointment has been scheduled. We\'ll be in touch with details.',
}

export default function ClientJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user?.email) { setUnauthorized(true); setLoading(false); return }

      // Fetch job, verify it belongs to this client via the API
      const res = await fetch('/api/client/jobs')
      const data = await res.json()
      const found = (data.jobs ?? []).find((j: JobDetail) => j.id === jobId)
      if (!found) {
        setUnauthorized(true)
      } else {
        setJob(found)
      }
      setLoading(false)
    })
  }, [jobId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
    </div>
  )

  if (unauthorized || !job) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Order not found or you don&apos;t have access.</p>
        <Link href="/client/jobs" className="text-[#1a1a2e] underline text-sm">Back to my orders</Link>
      </div>
    </div>
  )

  const amount = Number(job.quote_adjusted_amount ?? job.quote_amount ?? 0)
  const langLabel = job.source_lang && job.target_lang ? `${job.source_lang} → ${job.target_lang}` : null
  const statusMsg = STATUS_MESSAGES[job.status]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/client/jobs" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-semibold text-[#1a1a2e]">Order Detail</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Status card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Order Status</h2>
          <JobProgressBar jobType={job.job_type} status={job.status} />
          {statusMsg && (
            <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-800">
              {statusMsg}
            </div>
          )}
        </div>

        {/* Details card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Reference</dt><dd className="font-mono text-xs">{job.invoice_number ?? job.id.slice(0, 8).toUpperCase()}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Service</dt><dd className="capitalize">{job.job_type.replace('_', ' ')}</dd></div>
            {langLabel && <div className="flex justify-between"><dt className="text-gray-500">Languages</dt><dd>{langLabel}</dd></div>}
            {job.word_count && <div className="flex justify-between"><dt className="text-gray-500">Word count</dt><dd>{job.word_count.toLocaleString()} words</dd></div>}
            {job.estimated_turnaround_days && <div className="flex justify-between"><dt className="text-gray-500">Turnaround</dt><dd>{job.estimated_turnaround_days} business days</dd></div>}
            {job.requested_delivery_date && <div className="flex justify-between"><dt className="text-gray-500">Requested by</dt><dd>{new Date(job.requested_delivery_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</dd></div>}
            {job.scheduled_at && <div className="flex justify-between"><dt className="text-gray-500">Scheduled</dt><dd>{new Date(job.scheduled_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>}
            {amount > 0 && (
              <div className="flex justify-between border-t border-gray-100 pt-2.5 mt-2.5">
                <dt className="font-semibold text-gray-900">Total</dt>
                <dd className="font-bold text-[#1a1a2e]">{formatCurrency(amount)}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Download — only when delivered */}
        {job.delivery_token && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800 text-sm">Your document is ready</p>
              <p className="text-xs text-green-600 mt-0.5">Click to download your translated file</p>
            </div>
            <a
              href={`/delivery/${job.delivery_token}`}
              className="flex items-center gap-1.5 bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
            >
              <Download className="h-4 w-4" /> Download
            </a>
          </div>
        )}

        {/* Help */}
        <div className="text-center text-xs text-gray-400 pt-2">
          Questions? Call <a href="tel:2133857781" className="text-[#1a1a2e]">(213) 385-7781</a> or email{' '}
          <a href="mailto:info@latranslation.com" className="text-[#1a1a2e]">info@latranslation.com</a>
        </div>
      </main>
    </div>
  )
}
