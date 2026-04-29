import { createClient } from '@/lib/supabase/server'
import { JOB_TYPES, STATUS_LABELS, STATUS_COLORS } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { JobActionsDropdown } from '@/components/admin/job-actions-dropdown'

interface Props {
  searchParams: Promise<{ type?: string; status?: string; q?: string }>
}

export default async function JobsPage({ searchParams }: Props) {
  const { type, status, q } = await searchParams
  const supabase = await createClient()

  const isArchived = status === 'archived'

  let query = supabase
    .from('jobs')
    .select('id, job_type, status, created_at, source_lang, target_lang, word_count, quote_amount, quote_adjusted_amount, invoice_number, clients(contact_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (type) query = query.eq('job_type', type as 'translation' | 'interpretation' | 'equipment_rental' | 'notary')

  if (isArchived) {
    query = query.in('status', ['complete', 'cancelled'])
  } else if (status) {
    query = query.eq('status', status)
  } else {
    query = query.not('status', 'in', '(complete,cancelled)')
  }

  const { data: jobs } = await query

  const filtered = q
    ? (jobs ?? []).filter((j: any) =>
        j.clients?.contact_name?.toLowerCase().includes(q.toLowerCase()) ||
        j.clients?.email?.toLowerCase().includes(q.toLowerCase()) ||
        j.invoice_number?.toLowerCase().includes(q.toLowerCase())
      )
    : (jobs ?? [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Jobs</h1>
        <Link href="/admin/jobs/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: 'Active', href: '/admin/jobs', key: 'active' },
          { label: 'Translation', href: '/admin/jobs?type=translation', key: 'translation' },
          { label: 'Interpretation', href: '/admin/jobs?type=interpretation', key: 'interpretation' },
          { label: 'Equipment Rental', href: '/admin/jobs?type=equipment_rental', key: 'equipment_rental' },
          { label: 'Notary', href: '/admin/jobs?type=notary', key: 'notary' },
          { label: 'Transcription', href: '/admin/jobs?type=transcription', key: 'transcription' },
          { label: 'Archived', href: '/admin/jobs?status=archived', key: 'archived' },
        ].map((f) => {
          const isActive =
            f.key === 'archived' ? isArchived :
            f.key === 'active' ? (!type && !status) :
            type === f.key
          return (
            <Link
              key={f.href}
              href={f.href}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm border transition-colors',
                isActive
                  ? f.key === 'archived'
                    ? 'bg-gray-600 text-white border-gray-600'
                    : 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              )}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Languages</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Amount</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Date</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">No jobs found</td>
              </tr>
            )}
            {filtered.map((job: any) => (
              <tr key={job.id} className="hover:bg-gray-50 transition-colors group">
                {/* Each data cell is a full-height link so the whole row is clickable */}
                <td className="p-0">
                  <Link href={`/admin/jobs/${job.id}`} className="flex flex-col px-4 py-3">
                    <span className="font-medium text-gray-900">{job.clients?.contact_name ?? '—'}</span>
                    <span className="text-xs text-gray-400">{job.clients?.email}</span>
                  </Link>
                </td>
                <td className="p-0">
                  <Link href={`/admin/jobs/${job.id}`} className="flex items-center px-4 py-3 h-full text-gray-600">
                    {JOB_TYPES[job.job_type as keyof typeof JOB_TYPES]}
                  </Link>
                </td>
                <td className="p-0">
                  <Link href={`/admin/jobs/${job.id}`} className="flex items-center px-4 py-3 h-full text-gray-600">
                    {job.source_lang && job.target_lang ? `${job.source_lang} → ${job.target_lang}` : '—'}
                  </Link>
                </td>
                <td className="p-0">
                  <Link href={`/admin/jobs/${job.id}`} className="flex items-center px-4 py-3 h-full">
                    <Badge className={cn('text-xs', STATUS_COLORS[job.status] ?? 'bg-gray-100 text-gray-700')}>
                      {STATUS_LABELS[job.status] ?? job.status}
                    </Badge>
                  </Link>
                </td>
                <td className="p-0">
                  <Link href={`/admin/jobs/${job.id}`} className="flex items-center justify-end px-4 py-3 h-full text-gray-600">
                    {job.quote_adjusted_amount || job.quote_amount
                      ? formatCurrency(Number(job.quote_adjusted_amount ?? job.quote_amount))
                      : '—'}
                  </Link>
                </td>
                <td className="p-0">
                  <Link href={`/admin/jobs/${job.id}`} className="flex items-center justify-end px-4 py-3 h-full text-gray-400">
                    {formatDate(job.created_at)}
                  </Link>
                </td>
                <td className="px-2 py-1 w-10">
                  <JobActionsDropdown jobId={job.id} status={job.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
