import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { JOB_TYPES, STATUS_LABELS, STATUS_COLORS } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, FileText, User, Clock } from 'lucide-react'

interface Props {
  params: Promise<{ jobId: string }>
}

export default async function JobDetailPage({ params }: Props) {
  const { jobId } = await params
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('jobs')
    .select('*, clients(*), translators:assigned_translator_id(*), specialty_multipliers:specialty_id(name)')
    .eq('id', jobId)
    .single()

  if (!job) notFound()

  const { data: history } = await supabase
    .from('job_status_history')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  const { data: translatorInvoice } = await supabase
    .from('translator_invoices')
    .select('*')
    .eq('job_id', jobId)
    .maybeSingle()

  const displayAmount = job.quote_adjusted_amount ?? job.quote_amount
  const client = job.clients as any
  const translator = job.translators as any
  const specialty = job.specialty_multipliers as any

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/jobs" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-[#1a1a2e]">
          {JOB_TYPES[job.job_type as keyof typeof JOB_TYPES]} — {client?.contact_name}
        </h1>
        <Badge className={cn('text-xs ml-2', STATUS_COLORS[job.status] ?? 'bg-gray-100 text-gray-700')}>
          {STATUS_LABELS[job.status] ?? job.status}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['draft', 'quote_sent', 'quote_accepted', 'paid', 'ai_review_pending'].includes(job.status) && job.job_type === 'translation' && (
          <Link href={`/admin/jobs/${jobId}/quote`}>
            <Button variant="outline" size="sm">Review / Send Quote</Button>
          </Link>
        )}
        {['paid', 'ai_review_pending', 'ai_failed', 'assigned'].includes(job.status) && (
          <Link href={`/admin/jobs/${jobId}/assign`}>
            <Button variant="outline" size="sm">Assign Translator</Button>
          </Link>
        )}
        {['in_progress', 'assigned'].includes(job.status) && job.job_type === 'translation' && (
          <Link href={`/admin/jobs/${jobId}/deliver`}>
            <Button variant="outline" size="sm">Upload & Deliver</Button>
          </Link>
        )}
        {!translatorInvoice && ['delivered', 'complete'].includes(job.status) && (
          <Link href={`/admin/jobs/${jobId}/invoice`}>
            <Button variant="outline" size="sm">Record Vendor Invoice</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><User className="h-4 w-4" /> Client</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2"><dt className="text-gray-500 w-24">Name</dt><dd>{client?.contact_name}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-24">Email</dt><dd><a href={`mailto:${client?.email}`} className="text-blue-600 hover:underline">{client?.email}</a></dd></div>
            {client?.phone && <div className="flex gap-2"><dt className="text-gray-500 w-24">Phone</dt><dd>{client.phone}</dd></div>}
            {client?.company_name && <div className="flex gap-2"><dt className="text-gray-500 w-24">Company</dt><dd>{client.company_name}</dd></div>}
          </dl>
        </div>

        {/* Job Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Job Details</h2>
          <dl className="space-y-1.5 text-sm">
            {job.source_lang && <div className="flex gap-2"><dt className="text-gray-500 w-24">Languages</dt><dd>{job.source_lang} → {job.target_lang}</dd></div>}
            {specialty && <div className="flex gap-2"><dt className="text-gray-500 w-24">Specialty</dt><dd>{specialty.name}</dd></div>}
            {job.word_count && <div className="flex gap-2"><dt className="text-gray-500 w-24">Word Count</dt><dd>{job.word_count.toLocaleString()}</dd></div>}
            {job.scheduled_at && <div className="flex gap-2"><dt className="text-gray-500 w-24">Scheduled</dt><dd>{formatDateTime(job.scheduled_at)}</dd></div>}
            {job.duration_minutes && <div className="flex gap-2"><dt className="text-gray-500 w-24">Duration</dt><dd>{job.duration_minutes} min</dd></div>}
            {job.rental_start_date && <div className="flex gap-2"><dt className="text-gray-500 w-24">Rental</dt><dd>{job.rental_start_date} – {job.rental_end_date}</dd></div>}
            {job.notary_service_type && <div className="flex gap-2"><dt className="text-gray-500 w-24">Service</dt><dd className="capitalize">{job.notary_service_type}</dd></div>}
            {displayAmount && <div className="flex gap-2"><dt className="text-gray-500 w-24">Amount</dt><dd className="font-semibold">{formatCurrency(Number(displayAmount))}</dd></div>}
            {job.invoice_number && <div className="flex gap-2"><dt className="text-gray-500 w-24">Invoice #</dt><dd>{job.invoice_number}</dd></div>}
          </dl>
        </div>

        {/* Assignment */}
        {translator && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Assigned Translator</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2"><dt className="text-gray-500 w-24">Name</dt><dd>{translator.full_name}</dd></div>
              <div className="flex gap-2"><dt className="text-gray-500 w-24">Email</dt><dd><a href={`mailto:${translator.email}`} className="text-blue-600 hover:underline">{translator.email}</a></dd></div>
            </dl>
          </div>
        )}

        {/* Vendor Invoice */}
        {translatorInvoice && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Vendor Invoice</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2"><dt className="text-gray-500 w-24">Amount</dt><dd>{formatCurrency(Number(translatorInvoice.amount))}</dd></div>
              <div className="flex gap-2"><dt className="text-gray-500 w-24">Status</dt><dd className="capitalize">{translatorInvoice.status}</dd></div>
              {translatorInvoice.payout_due_at && <div className="flex gap-2"><dt className="text-gray-500 w-24">Due</dt><dd>{formatDateTime(translatorInvoice.payout_due_at)}</dd></div>}
            </dl>
          </div>
        )}
      </div>

      {/* Status History */}
      {history && history.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Clock className="h-4 w-4" /> Status History</h2>
          <div className="space-y-2">
            {history.map((h: any) => (
              <div key={h.id} className="flex items-start gap-3 text-sm">
                <span className="text-gray-400 text-xs w-36 flex-shrink-0">{formatDateTime(h.created_at)}</span>
                <span className="text-gray-600">
                  {h.old_status && <span className="line-through text-gray-400 mr-1">{STATUS_LABELS[h.old_status] ?? h.old_status}</span>}
                  → <span className="font-medium">{STATUS_LABELS[h.new_status] ?? h.new_status}</span>
                  {h.note && <span className="text-gray-400 ml-2">— {h.note}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
