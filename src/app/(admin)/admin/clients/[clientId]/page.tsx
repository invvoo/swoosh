import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { JOB_TYPES, STATUS_LABELS, STATUS_COLORS } from '@/types'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props { params: Promise<{ clientId: string }> }

export default async function ClientDetailPage({ params }: Props) {
  const { clientId } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: jobs }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', clientId).single(),
    supabase.from('jobs').select('id, job_type, status, invoice_number, quote_amount, quote_adjusted_amount, created_at, source_lang, target_lang').eq('client_id', clientId).order('created_at', { ascending: false }),
  ])

  if (!client) notFound()

  const totalSpend = (jobs ?? []).reduce((s, j) => s + Number(j.quote_adjusted_amount ?? j.quote_amount ?? 0), 0)

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/clients" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">{client.contact_name}</h1>
          {client.company_name && <p className="text-sm text-gray-500">{client.company_name}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Jobs</p>
          <p className="text-2xl font-bold text-[#1a1a2e]">{(jobs ?? []).length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Spend</p>
          <p className="text-2xl font-bold text-[#1a1a2e]">{formatCurrency(totalSpend)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold mb-3">Contact Info</h2>
        <dl className="space-y-1.5 text-sm">
          <div className="flex gap-2"><dt className="text-gray-500 w-24">Email</dt><dd><a href={`mailto:${client.email}`} className="text-blue-600">{client.email}</a></dd></div>
          {client.phone && <div className="flex gap-2"><dt className="text-gray-500 w-24">Phone</dt><dd>{client.phone}</dd></div>}
          <div className="flex gap-2"><dt className="text-gray-500 w-24">Client since</dt><dd>{formatDate(client.created_at)}</dd></div>
          {client.notes && <div className="flex gap-2"><dt className="text-gray-500 w-24">Notes</dt><dd>{client.notes}</dd></div>}
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 font-semibold">Job History</div>
        <div className="divide-y divide-gray-50">
          {(jobs ?? []).map((job) => (
            <Link key={job.id} href={`/admin/jobs/${job.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 text-sm">
              <span className="text-gray-400 w-32">{job.invoice_number ?? job.id.slice(0, 8)}</span>
              <span className="flex-1">{JOB_TYPES[job.job_type as keyof typeof JOB_TYPES]}{job.source_lang ? ` — ${job.source_lang} → ${job.target_lang}` : ''}</span>
              <Badge className={cn('text-xs', STATUS_COLORS[job.status] ?? 'bg-gray-100 text-gray-700')}>{STATUS_LABELS[job.status] ?? job.status}</Badge>
              <span className="text-gray-500">{formatCurrency(Number(job.quote_adjusted_amount ?? job.quote_amount ?? 0))}</span>
              <span className="text-gray-400">{formatDate(job.created_at)}</span>
            </Link>
          ))}
          {(jobs ?? []).length === 0 && <p className="px-6 py-8 text-center text-gray-400 text-sm">No jobs</p>}
        </div>
      </div>
    </div>
  )
}
