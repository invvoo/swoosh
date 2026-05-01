import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { JOB_TYPES, STATUS_LABELS, STATUS_COLORS } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, FileText, User, Clock, AlertTriangle, UserCheck } from 'lucide-react'
import { StatusActions } from '@/components/admin/status-actions'
import { JobFinalActions } from '@/components/admin/job-final-actions'
import { ClaimJobButton } from '@/components/admin/claim-job-button'
import { TranslationWorkflowActions } from '@/components/admin/translation-workflow-actions'
import { AdminNotesPanel } from '@/components/admin/admin-notes-panel'
import { ManualPaymentButton } from '@/components/admin/manual-payment-button'

interface Props {
  params: Promise<{ jobId: string }>
}

export default async function JobDetailPage({ params }: Props) {
  const { jobId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: job },
    { data: history },
    { data: translatorInvoice },
    { data: adminEmployee },
    { data: allEmployees },
  ] = await Promise.all([
    (supabase as any).from('jobs').select('*, clients(*), translators:assigned_translator_id(*), specialty_multipliers:specialty_id(name), handler:employees!jobs_handled_by_fkey(id, full_name)').eq('id', jobId).single(),
    supabase.from('job_status_history').select('*').eq('job_id', jobId).order('created_at', { ascending: false }),
    supabase.from('translator_invoices').select('*').eq('job_id', jobId).maybeSingle(),
    user ? supabase.from('employees').select('id, full_name').eq('id', user.id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('employees').select('id, full_name').order('full_name'),
  ])

  if (!job) notFound()

  // Resolve employee names for history entries
  const changedByIds = Array.from(new Set((history ?? []).map((h: any) => h.changed_by).filter(Boolean)))
  let employeeNames: Record<string, string> = {}
  if (changedByIds.length > 0) {
    const { data: employees } = await supabase.from('employees').select('id, full_name').in('id', changedByIds)
    employeeNames = Object.fromEntries((employees ?? []).map((e: any) => [e.id, e.full_name]))
  }

  const adminName = (adminEmployee as any)?.full_name ?? user?.email ?? 'Admin'
  const handler = (job as any).handler as { id: string; full_name: string } | null
  const employees = (allEmployees ?? []) as { id: string; full_name: string }[]
  const displayAmount = job.quote_adjusted_amount ?? job.quote_amount
  const client = job.clients as any
  const translator = job.translators as any
  const specialty = job.specialty_multipliers as any
  const documentPaths = (job as any).document_paths as { path: string; name: string }[] | null
  // Build the list of original documents to show (use document_paths if available, fall back to document_path)
  const originalDocs: { label: string; href: string }[] = (() => {
    if (documentPaths && documentPaths.length > 0) {
      return documentPaths.map((d, i) => ({
        label: documentPaths.length === 1 ? 'View Original' : `Doc ${i + 1}: ${d.name}`,
        href: `/api/admin/jobs/${jobId}/document?index=${i}`,
      }))
    }
    if ((job as any).document_path) {
      return [{ label: 'View Original', href: `/api/admin/jobs/${jobId}/document` }]
    }
    return []
  })()

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
        {/* Translation: guided primary CTA per status */}
        {job.job_type === 'translation' && (
          <TranslationWorkflowActions
            jobId={jobId}
            status={job.status}
            hasDocument={!!(job as any).document_path}
            hasAiDraft={!!(job as any).ai_draft_path}
            hasVendorSubmission={!!(job as any).translated_doc_path}
          />
        )}

        {/* Non-translation: sequential status buttons */}
        {job.job_type !== 'translation' && (
          <>
            <StatusActions jobId={jobId} jobType={job.job_type} status={job.status} />
            {['draft', 'quote_sent'].includes(job.status) && (
              <Link href={`/admin/jobs/${jobId}/quote`}>
                <Button variant="outline" size="sm">Review / Edit Quote</Button>
              </Link>
            )}
            {/* Interpretation: assign page handles interpreter selection + confirmation email */}
            {job.job_type === 'interpretation' && ['confirmed', 'paid'].includes(job.status) && (
              <Link href={`/admin/jobs/${jobId}/assign`}>
                <Button size="sm" className="bg-[#1a1a2e] hover:bg-[#2a2a4e]">
                  <UserCheck className="h-4 w-4" /> Assign Interpreter
                </Button>
              </Link>
            )}
          </>
        )}

        {/* View original document(s) — one button per uploaded file */}
        {job.job_type === 'translation' && originalDocs.map((doc) => (
          <a key={doc.href} href={doc.href} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="max-w-[220px] truncate">{doc.label}</Button>
          </a>
        ))}

        {/* Record vendor invoice after delivery */}
        {!translatorInvoice && ['delivered', 'complete'].includes(job.status) && (
          <Link href={`/admin/jobs/${jobId}/invoice`}>
            <Button variant="outline" size="sm">Record Vendor Invoice</Button>
          </Link>
        )}

        {/* Manual payment for in-person / phone orders that haven't been paid via Stripe */}
        {['draft', 'quote_sent', 'quote_accepted', 'confirmed'].includes(job.status) && (
          <ManualPaymentButton jobId={jobId} currentStatus={job.status} />
        )}

        {/* Final actions: Mark Complete (translation only after delivered) + Not Proceeding */}
        <JobFinalActions jobId={jobId} status={job.status} adminName={adminName} jobType={job.job_type} />
      </div>

      {/* Handler assignment */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center gap-3">
        <UserCheck className="h-4 w-4 text-gray-400 shrink-0" />
        <span className="text-sm text-gray-500 w-24 shrink-0">Handled by</span>
        {user && (
          <ClaimJobButton
            jobId={jobId}
            currentUserId={user.id}
            handler={handler}
            employees={employees}
          />
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
            {(job as any).detected_source_lang && (() => {
              const confidence: number | null = (job as any).detected_source_lang_confidence ?? null
              const badgeColor = confidence === null ? 'bg-gray-100 text-gray-600' : confidence >= 0.8 ? 'bg-green-100 text-green-700' : confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
              return (
                <div className="flex gap-2 items-center">
                  <dt className="text-gray-500 w-24">Detected</dt>
                  <dd className="flex items-center gap-1.5">
                    {(job as any).detected_source_lang}
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', badgeColor)}>
                      {confidence !== null ? `${Math.round(confidence * 100)}% confidence` : 'unknown confidence'}
                    </span>
                  </dd>
                </div>
              )
            })()}
            {(job as any).certification_type && (() => {
              const certLabels: Record<string, string> = {
                none: 'None',
                general: 'General / Company',
                court: 'Court Certified',
              }
              return (
                <div className="flex gap-2"><dt className="text-gray-500 w-24">Certification</dt><dd>{certLabels[(job as any).certification_type] ?? (job as any).certification_type}</dd></div>
              )
            })()}
            {specialty && <div className="flex gap-2"><dt className="text-gray-500 w-24">Specialty</dt><dd>{specialty.name}</dd></div>}
            {job.word_count && <div className="flex gap-2"><dt className="text-gray-500 w-24">Word Count</dt><dd>{job.word_count.toLocaleString()}</dd></div>}
            {job.scheduled_at && <div className="flex gap-2"><dt className="text-gray-500 w-24">Scheduled</dt><dd>{formatDateTime(job.scheduled_at)}</dd></div>}
            {job.duration_minutes && <div className="flex gap-2"><dt className="text-gray-500 w-24">Duration</dt><dd>{job.duration_minutes} min</dd></div>}
            {job.location_type && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Format</dt>
                <dd className="capitalize">{job.location_type === 'in_person' ? 'In-Person' : job.location_type === 'phone' ? 'Phone' : 'Video / Remote'}</dd>
              </div>
            )}
            {job.location_details && <div className="flex gap-2"><dt className="text-gray-500 w-24">Location</dt><dd>{job.location_details}</dd></div>}
            {(job as any).interpretation_mode && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Mode</dt>
                <dd className="capitalize">{(job as any).interpretation_mode}</dd>
              </div>
            )}
            {(job as any).interpretation_cert_required && (job as any).interpretation_cert_required !== 'none' && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Cert Required</dt>
                <dd className="font-medium text-orange-700">
                  {(job as any).interpretation_cert_required === 'court' ? 'Court-Certified' : 'Medical (CCHI/NB)'}
                </dd>
              </div>
            )}
            {job.job_type === 'interpretation' && (job as any).quote_interpretation_rate && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Rate</dt>
                <dd>
                  ${Number((job as any).quote_interpretation_rate).toFixed(2)}/session
                  {(job as any).quote_billed_minutes && <> · {(job as any).quote_billed_minutes} min billed</>}
                  {displayAmount && <> · Est. {formatCurrency(Number(displayAmount))}</>}
                </dd>
              </div>
            )}
            {job.rental_start_date && <div className="flex gap-2"><dt className="text-gray-500 w-24">Rental</dt><dd>{job.rental_start_date} – {job.rental_end_date}</dd></div>}
            {job.notary_service_type && <div className="flex gap-2"><dt className="text-gray-500 w-24">Service</dt><dd className="capitalize">{(job.notary_service_type as string).replace(/_/g, ' ')}</dd></div>}
            {(job as any).delivery_method && <div className="flex gap-2"><dt className="text-gray-500 w-24">Delivery</dt><dd className="capitalize">{(job as any).delivery_method.replace(/_/g, ' ')}</dd></div>}
            {(job as any).notary_address && <div className="flex gap-2"><dt className="text-gray-500 w-24">Address</dt><dd>{(job as any).notary_address}</dd></div>}
            {(job as any).notary_signature_count && <div className="flex gap-2"><dt className="text-gray-500 w-24">Signatures</dt><dd>{(job as any).notary_signature_count}</dd></div>}
            {(job as any).appointment_at && <div className="flex gap-2"><dt className="text-gray-500 w-24">Appointment</dt><dd>{formatDateTime((job as any).appointment_at)}</dd></div>}
            {(job as any).dispatch_at && <div className="flex gap-2"><dt className="text-gray-500 w-24">Dispatched</dt><dd>{formatDateTime((job as any).dispatch_at)}</dd></div>}
            {(job as any).return_at && <div className="flex gap-2"><dt className="text-gray-500 w-24">Returned</dt><dd>{formatDateTime((job as any).return_at)}</dd></div>}
            {(job as any).rental_items && Array.isArray((job as any).rental_items) && (job as any).rental_items.length > 0 && (
              <div className="flex gap-2 col-span-2">
                <dt className="text-gray-500 w-24 shrink-0">Items</dt>
                <dd className="space-y-0.5">
                  {(job as any).rental_items.map((item: any, i: number) => (
                    <div key={i}>{item.qty}× {item.name} @ {formatCurrency(item.ratePerDay)}/day</div>
                  ))}
                </dd>
              </div>
            )}
            {(job as any).media_name && (
              <div className="flex gap-2 items-center">
                <dt className="text-gray-500 w-24">Media File</dt>
                <dd className="flex items-center gap-2">
                  <span className="truncate max-w-[200px]">{(job as any).media_name}</span>
                  <a href={`/api/admin/jobs/${jobId}/document?type=media`} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 text-xs hover:underline">Download</a>
                </dd>
              </div>
            )}
            {(job as any).transcription_service_type && (
              <div className="flex gap-2"><dt className="text-gray-500 w-24">Service</dt>
                <dd className="capitalize">{(job as any).transcription_service_type === 'both' ? 'Transcription + Subtitles' : (job as any).transcription_service_type}</dd>
              </div>
            )}
            {(job as any).media_duration_seconds && (
              <div className="flex gap-2"><dt className="text-gray-500 w-24">Duration</dt>
                <dd>{Math.floor((job as any).media_duration_seconds / 60)}m {(job as any).media_duration_seconds % 60}s</dd>
              </div>
            )}
            {/* Rate breakdown */}
            {(job as any).quote_per_word_rate != null && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Rate</dt>
                <dd>
                  ${Number((job as any).quote_per_word_rate).toFixed(4)}/word
                  {(job as any).quote_multiplier != null && Number((job as any).quote_multiplier) !== 1
                    ? ` × ${Number((job as any).quote_multiplier).toFixed(2)} (specialty)`
                    : ''}
                  {(job as any).quote_is_pivot ? <span className="text-xs text-amber-600 ml-1">(pivot via English)</span> : null}
                </dd>
              </div>
            )}
            {(job as any).quote_rush_days > 0 && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Rush Fee</dt>
                <dd>
                  {(job as any).quote_rush_days}d rushed · {(job as any).quote_rush_fee_percent}%
                  {(job as any).quote_rush_amount != null ? ` = +${formatCurrency(Number((job as any).quote_rush_amount))}` : ''}
                </dd>
              </div>
            )}
            {(job as any).mailing_option && (() => {
              const labels: Record<string, string> = { standard: 'Standard Mail', hard_copy: 'Hard Copy + Notary' }
              return (
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-24">Mailing</dt>
                  <dd className="flex items-center gap-2">
                    {labels[(job as any).mailing_option] ?? (job as any).mailing_option}
                    {(job as any).mailing_fedex_overnight && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">FedEx Overnight</span>}
                    {(job as any).mailing_amount != null ? ` +${formatCurrency(Number((job as any).mailing_amount))}` : ''}
                  </dd>
                </div>
              )
            })()}
            {displayAmount && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Quote</dt>
                <dd className="font-semibold text-[#1a1a2e]">
                  {formatCurrency(Number(displayAmount))}
                  {job.quote_adjusted_amount && job.quote_amount && job.quote_adjusted_amount !== job.quote_amount && (
                    <span className="text-xs text-gray-400 ml-1.5 font-normal line-through">{formatCurrency(Number(job.quote_amount))}</span>
                  )}
                </dd>
              </div>
            )}
            {job.invoice_number && <div className="flex gap-2"><dt className="text-gray-500 w-24">Invoice #</dt><dd>{job.invoice_number}</dd></div>}
          </dl>
          {(job as any).missing_pricing_warning && (
            <div className="mt-4 flex gap-3 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Missing Pricing: {(job as any).missing_pricing_warning}</p>
                <p className="text-xs text-amber-700 mt-0.5">Admin must set quote amount manually before sending.</p>
              </div>
            </div>
          )}
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
                <span className="text-gray-600 flex-1">
                  {h.old_status && <span className="line-through text-gray-400 mr-1">{STATUS_LABELS[h.old_status] ?? h.old_status}</span>}
                  → <span className="font-medium">{STATUS_LABELS[h.new_status] ?? h.new_status}</span>
                  {h.note && <span className="text-gray-400 ml-2">— {h.note}</span>}
                  {h.changed_by && employeeNames[h.changed_by] && (
                    <span className="text-gray-400 ml-2 text-xs">by {employeeNames[h.changed_by]}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AdminNotesPanel jobId={jobId} initialNotes={(job as any).employee_notes ?? null} />
    </div>
  )
}
