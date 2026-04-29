import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { JOB_TYPES, STATUS_LABELS, STATUS_COLORS } from '@/types'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { JobActionsDropdown } from '@/components/admin/job-actions-dropdown'

async function getDashboardData(supabase: Awaited<ReturnType<typeof createClient>>) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { data: activeJobs },
    { data: recentJobs },
    { data: pendingQuotes },
    { data: pendingPayouts },
    { data: monthRevenue },
  ] = await Promise.all([
    supabase.from('jobs').select('id', { count: 'exact' }).not('status', 'in', '(complete,cancelled)'),
    supabase.from('jobs').select('id, job_type, status, created_at, clients(contact_name, email), quote_amount, quote_adjusted_amount, invoice_number').order('created_at', { ascending: false }).limit(10),
    supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'draft'),
    supabase.from('translator_invoices').select('id', { count: 'exact' }).eq('status', 'approved').lte('payout_due_at', now.toISOString()),
    supabase.from('jobs').select('quote_adjusted_amount, quote_amount').not('payment_collected_at', 'is', null).gte('payment_collected_at', startOfMonth),
  ])

  const revenue = (monthRevenue ?? []).reduce((sum, j) => {
    return sum + (Number(j.quote_adjusted_amount ?? j.quote_amount) || 0)
  }, 0)

  return {
    activeJobs: activeJobs?.length ?? 0,
    recentJobs: recentJobs ?? [],
    pendingQuotes: pendingQuotes?.length ?? 0,
    pendingPayouts: pendingPayouts?.length ?? 0,
    monthRevenue: revenue,
  }
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { activeJobs, recentJobs, pendingQuotes, pendingPayouts, monthRevenue } = await getDashboardData(supabase)

  const stats = [
    { label: 'Active Jobs', value: activeJobs, href: '/admin/jobs' },
    { label: 'Pending Quotes', value: pendingQuotes, href: '/admin/jobs?status=draft' },
    { label: 'Revenue This Month', value: formatCurrency(monthRevenue), href: '/admin/jobs' },
    { label: 'Payouts Due', value: pendingPayouts, href: '/admin/invoices' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-[#1a1a2e] mt-1">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Jobs</h2>
          <Link href="/admin/jobs" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentJobs.length === 0 && (
            <p className="px-6 py-8 text-center text-gray-400 text-sm">No jobs yet</p>
          )}
          {recentJobs.map((job: any) => (
            <div key={job.id} className="flex items-center hover:bg-gray-50 transition-colors group">
              <Link href={`/admin/jobs/${job.id}`} className="flex items-center gap-4 px-6 py-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {(job.clients as any)?.contact_name ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500">{JOB_TYPES[job.job_type as keyof typeof JOB_TYPES]}</p>
                </div>
                <Badge className={cn('text-xs', STATUS_COLORS[job.status] ?? 'bg-gray-100 text-gray-700')}>
                  {STATUS_LABELS[job.status] ?? job.status}
                </Badge>
                <span className="text-sm text-gray-500 w-20 text-right shrink-0">
                  {job.quote_adjusted_amount || job.quote_amount
                    ? formatCurrency(Number(job.quote_adjusted_amount ?? job.quote_amount))
                    : '—'}
                </span>
              </Link>
              <div className="px-3">
                <JobActionsDropdown jobId={job.id} status={job.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
