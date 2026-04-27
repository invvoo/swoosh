import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import PayoutButton from './payout-button'

export default async function InvoicesPage() {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('translator_invoices')
    .select('*, translators(full_name, email, stripe_connect_id), jobs(invoice_number, job_type, clients(contact_name))')
    .in('status', ['approved', 'queued', 'paid', 'failed'])
    .order('payout_due_at', { ascending: true })

  const pending = (invoices ?? []).filter((i) => i.status === 'approved')
  const others = (invoices ?? []).filter((i) => i.status !== 'approved')
  const now = new Date()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-6">Invoices &amp; Payouts</h1>

      {/* Pending payouts */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Pending Payouts ({pending.length})</h2>
        </div>
        {pending.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">No pending payouts</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Translator</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Job</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Amount</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Due</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pending.map((inv: any) => {
                const isDue = inv.payout_due_at && new Date(inv.payout_due_at) <= now
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{inv.translators?.full_name}</p>
                      <p className="text-xs text-gray-400">{inv.translators?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {inv.jobs?.invoice_number ?? inv.job_id.slice(0, 8)}
                      <p className="text-xs text-gray-400">{inv.jobs?.clients?.contact_name}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(inv.amount))}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={isDue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {inv.payout_due_at ? formatDate(inv.payout_due_at) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.translators?.stripe_connect_id ? (
                        <PayoutButton invoiceId={inv.id} />
                      ) : (
                        <span className="text-xs text-gray-400">No Stripe account</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* History */}
      {others.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">History</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Translator</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Job</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Amount</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {others.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{inv.translators?.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.jobs?.invoice_number ?? inv.job_id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(inv.amount))}</td>
                  <td className="px-4 py-3 text-right capitalize">
                    <span className={inv.status === 'paid' ? 'text-green-600 font-medium' : inv.status === 'failed' ? 'text-red-600' : 'text-gray-600'}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">{inv.paid_at ? formatDate(inv.paid_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
