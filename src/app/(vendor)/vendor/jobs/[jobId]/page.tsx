'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Loader2, FileText, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VendorJob {
  id: string; job_type: string; status: string; source_lang: string | null
  target_lang: string | null; word_count: number | null; invoice_number: string | null
  deadline_at: string | null; assigned_at: string | null; created_at: string
  document_name: string | null; clients: { contact_name: string } | null
}

export default function VendorJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const [job, setJob] = useState<VendorJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [docUrl, setDocUrl] = useState<string | null>(null)
  const [draftUrl, setDraftUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/vendor/jobs').then(async (r) => {
      const d = await r.json()
      const found = (d.jobs ?? []).find((j: VendorJob) => j.id === jobId)
      setJob(found ?? null)
      setLoading(false)
    })
  }, [jobId])

  async function loadDocUrl() {
    const res = await fetch(`/api/admin/jobs/${jobId}/document`)
    if (res.ok && res.url) setDocUrl(res.url)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-gray-400" /></div>
  if (!job) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-3">Job not found.</p>
        <Link href="/vendor/jobs" className="text-[#1a1a2e] underline text-sm">Back to jobs</Link>
      </div>
    </div>
  )

  const langLabel = job.source_lang && job.target_lang ? `${job.source_lang} → ${job.target_lang}` : null
  const deadline = job.deadline_at ? new Date(job.deadline_at) : null
  const isOverdue = deadline && deadline < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/vendor/jobs" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></Link>
          <span className="font-semibold text-[#1a1a2e]">Job Detail</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize',
                job.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-500'
              )}>
                {job.status.replace('_', ' ')}
              </span>
              {job.invoice_number && <span className="text-xs text-gray-400 font-mono ml-2">{job.invoice_number}</span>}
            </div>
            {deadline && (
              <div className={cn('flex items-center gap-1.5 text-sm font-medium', isOverdue ? 'text-red-600' : 'text-gray-600')}>
                <Clock className="h-4 w-4" />
                Due {deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>

          <dl className="space-y-2.5 text-sm">
            {langLabel && <div className="flex justify-between"><dt className="text-gray-500">Languages</dt><dd className="font-medium">{langLabel}</dd></div>}
            {job.word_count && <div className="flex justify-between"><dt className="text-gray-500">Word count</dt><dd>{job.word_count.toLocaleString()} words</dd></div>}
            <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd className="capitalize">{job.job_type.replace('_', ' ')}</dd></div>
            {job.assigned_at && <div className="flex justify-between"><dt className="text-gray-500">Assigned</dt><dd>{new Date(job.assigned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</dd></div>}
          </dl>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Documents</h2>
          <div className="space-y-3">
            <a
              href={`/api/admin/jobs/${jobId}/document`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm"
            >
              <FileText className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{job.document_name ?? 'Original Document'}</p>
                <p className="text-xs text-gray-500">Source file to translate</p>
              </div>
              <Download className="h-4 w-4 text-gray-400" />
            </a>

            <a
              href={`/api/admin/jobs/${jobId}/document?type=draft`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm"
            >
              <FileText className="h-5 w-5 text-purple-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">AI Draft</p>
                <p className="text-xs text-gray-500">AI-generated first draft — review and refine</p>
              </div>
              <Download className="h-4 w-4 text-gray-400" />
            </a>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-800">
          <p className="font-medium mb-1">How to submit your work</p>
          <p className="text-blue-700 text-xs">
            When you have completed the translation, email your final file to{' '}
            <a href="mailto:info@latranslation.com" className="underline">info@latranslation.com</a>{' '}
            with the job reference number in the subject line. Your coordinator will upload it and notify the client.
          </p>
        </div>

        <div className="text-center text-xs text-gray-400">
          Questions? Contact your coordinator at{' '}
          <a href="tel:2133857781" className="text-[#1a1a2e]">(213) 385-7781</a>
        </div>
      </main>
    </div>
  )
}
