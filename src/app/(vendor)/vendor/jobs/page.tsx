'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { LogOut, ChevronRight, FileText, AlertCircle, Clock, Clock3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-green-100 text-green-700',
  complete: 'bg-gray-100 text-gray-500',
  ai_review_pending: 'bg-purple-100 text-purple-700',
}

interface Job {
  id: string; job_type: string; status: string; source_lang: string | null
  target_lang: string | null; word_count: number | null; invoice_number: string | null
  deadline_at: string | null; assigned_at: string | null; created_at: string
  clients: { contact_name: string } | null
}

export default function VendorJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [translatorName, setTranslatorName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/vendor/jobs')
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) {
          if (d.error === 'no_account') {
            router.replace('/vendor/signup')
            return
          }
          setErrorCode(d.error ?? null)
          setError(d.message ?? 'Failed to load')
          return
        }
        setJobs(d.jobs ?? [])
        setTranslatorName(d.translator?.full_name ?? '')
      })
      .finally(() => setLoading(false))
  }, [router])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/vendor/login')
    router.refresh()
  }

  const active = jobs.filter((j) => !['delivered', 'complete'].includes(j.status))
  const past = jobs.filter((j) => ['delivered', 'complete'].includes(j.status))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-[#1a1a2e] text-sm">Vendor Portal</p>
            {translatorName && <p className="text-xs text-gray-500">{translatorName}</p>}
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {error && errorCode === 'pending_approval' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4 mb-6">
            <Clock3 className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">Application Pending Review</p>
              <p className="text-sm text-amber-700">
                Your vendor application has been received and is being reviewed by our team.
                We will contact you once your account is approved.
              </p>
            </div>
          </div>
        )}
        {error && errorCode === 'no_account' && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-start gap-4 mb-6">
            <AlertCircle className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">No vendor account found</p>
              <p className="text-sm text-gray-600 mb-3">
                There is no vendor profile linked to this email address.
                If you&apos;d like to work with us, please submit an application.
              </p>
              <Link href="/vendor/signup" className="text-sm font-medium text-[#1a1a2e] underline">
                Apply to join our network →
              </Link>
            </div>
          </div>
        )}
        {error && errorCode !== 'pending_approval' && errorCode !== 'no_account' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3 mb-6">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!error && <h1 className="text-xl font-bold text-[#1a1a2e] mb-6">Assigned Jobs</h1>}

        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="bg-white rounded-xl border p-6 animate-pulse h-24" />)}
          </div>
        )}

        {!loading && jobs.length === 0 && !error && (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No jobs assigned yet.</p>
          </div>
        )}

        {active.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Active</h2>
            <div className="space-y-3">
              {active.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Completed</h2>
            <div className="space-y-3">
              {past.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function JobCard({ job }: { job: Job }) {
  const langLabel = job.source_lang && job.target_lang ? `${job.source_lang} → ${job.target_lang}` : null
  const deadline = job.deadline_at ? new Date(job.deadline_at) : null
  const isOverdue = deadline && deadline < new Date() && !['delivered', 'complete'].includes(job.status)

  return (
    <Link href={`/vendor/jobs/${job.id}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', STATUS_COLORS[job.status] ?? 'bg-gray-100 text-gray-500')}>
              {job.status.replace('_', ' ')}
            </span>
            {job.invoice_number && <span className="text-xs text-gray-400 font-mono">{job.invoice_number}</span>}
          </div>
          {langLabel && <p className="text-sm font-medium text-gray-900">{langLabel}</p>}
          {job.word_count && <p className="text-xs text-gray-500 mt-0.5">{job.word_count.toLocaleString()} words</p>}
        </div>
        <div className="flex items-center gap-2">
          {deadline && (
            <div className={cn('flex items-center gap-1 text-xs', isOverdue ? 'text-red-600' : 'text-gray-400')}>
              <Clock className="h-3 w-3" />
              {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>
    </Link>
  )
}
