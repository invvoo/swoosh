import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SettingsPage() {
  const supabase = await createClient()

  const [{ data: langPairs }, { data: multipliers }, { data: equipment }] = await Promise.all([
    supabase.from('language_pairs').select('*').order('source_lang').order('target_lang'),
    supabase.from('specialty_multipliers').select('*').order('name'),
    supabase.from('equipment_items').select('*').order('name'),
  ])

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-2xl font-bold text-[#1a1a2e]">Settings</h1>

      {/* Language Pairs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Language Pairs &amp; Rates</h2>
          <Link href="/admin/settings/language-pairs/new">
            <Button size="sm" variant="outline">+ Add Pair</Button>
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Source</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Target</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Rate / Word</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(langPairs ?? []).map((lp) => (
                <tr key={lp.id}>
                  <td className="px-4 py-2.5">{lp.source_lang}</td>
                  <td className="px-4 py-2.5">{lp.target_lang}</td>
                  <td className="px-4 py-2.5 text-right">${Number(lp.per_word_rate).toFixed(4)}</td>
                  <td className="px-4 py-2.5 text-right">{lp.is_active ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Specialty Multipliers */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Specialty Multipliers</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Specialty</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Multiplier</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(multipliers ?? []).map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2.5">{m.name}</td>
                  <td className="px-4 py-2.5 text-right">{Number(m.multiplier).toFixed(2)}×</td>
                  <td className="px-4 py-2.5 text-right">{m.is_active ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Equipment Inventory */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Equipment Inventory</h2>
          <Link href="/admin/equipment">
            <Button size="sm" variant="outline">Manage Equipment</Button>
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Item</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Qty Total</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Available</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Rate/Day</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Deposit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(equipment ?? []).map((eq) => (
                <tr key={eq.id}>
                  <td className="px-4 py-2.5 font-medium">{eq.name}</td>
                  <td className="px-4 py-2.5 text-right">{eq.quantity_total}</td>
                  <td className="px-4 py-2.5 text-right">{eq.quantity_available}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(Number(eq.rate_per_day))}</td>
                  <td className="px-4 py-2.5 text-right">{Number(eq.deposit_amount) > 0 ? formatCurrency(Number(eq.deposit_amount)) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
