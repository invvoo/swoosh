import { createClient } from '@/lib/supabase/server'
import { JOB_TYPES, STATUS_LABELS, STATUS_COLORS } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface Props {
  searchParams: Promise<{ type?: string; status?: string; q?: string }>
}

export default async function JobsPage({ searchParams }: Props) {
  const { type, status, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('jobs')
    .select('id, job_type, status, created_at, source_lang, target_lang, word_count, quote_amount, quote_adjusted_amount, invoice_number, clients(contact_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (type) query = query.eq('job_type', type as 'translation' | 'interpretation' | 'equipment_rental' | 'notary')
  if (status) query = query.eq('status', status)

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
          { label: 'All', href: '/admin/jobs' },
          { label: 'Translation', href: '/admin/jobs?type=translation' },
          { label: 'Interpretation', href: '/admin/jobs?type=interpretation' },
          { label: 'Equipment Rental', href: '/admin/jobs?type=equipment_rental' },
          { label: 'Notary', href: '/admin/jobs?type=notary' },
        ].map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm border transition-colors',
              (!type && f.label === 'All') || type === f.label.toLowerCase().replace(' ', '_')
                ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            )}
          >
            {f.label}
          </Link>
        ))}
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">No jobs found</td>
              </tr>
            )}
            {filtered.map((job: any) => (
              <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/jobs/${job.id}`} className="hover:underline font-medium text-gray-900">
                    {job.clients?.contact_name ?? '—'}
                  </Link>
                  <p className="text-xs text-gray-400">{job.clients?.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{JOB_TYPES[job.job_type as keyof typeof JOB_TYPES]}</td>
                <td className="px-4 py-3 text-gray-600">
                  {job.source_lang && job.target_lang ? `${job.source_lang} → ${job.target_lang}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge className={cn('text-xs', STATUS_COLORS[job.status] ?? 'bg-gray-100 text-gray-700')}>
                    {STATUS_LABELS[job.status] ?? job.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {job.quote_adjusted_amount || job.quote_amount
                    ? formatCurrency(Number(job.quote_adjusted_amount ?? job.quote_amount))
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-400">{formatDate(job.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
