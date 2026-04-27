import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function TranslatorsPage() {
  const supabase = await createClient()
  const { data: translators } = await supabase
    .from('translators')
    .select('id, full_name, email, phone, language_pairs, specialties, stripe_connect_status, is_active')
    .order('full_name')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Translators &amp; Interpreters</h1>
        <Link href="/admin/translators/new">
          <Button size="sm"><Plus className="h-4 w-4" /> Add Translator</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Languages</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Stripe</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(translators ?? []).map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{t.full_name}</p>
                  <p className="text-xs text-gray-400">{t.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {(t.language_pairs ?? []).slice(0, 3).join(', ')}
                  {(t.language_pairs ?? []).length > 3 && ` +${t.language_pairs.length - 3} more`}
                </td>
                <td className="px-4 py-3">
                  <Badge className={cn('text-xs', {
                    'bg-green-100 text-green-700': t.stripe_connect_status === 'active',
                    'bg-yellow-100 text-yellow-700': t.stripe_connect_status === 'pending',
                    'bg-red-100 text-red-700': t.stripe_connect_status === 'restricted',
                    'bg-gray-100 text-gray-500': !t.stripe_connect_status,
                  })}>
                    {t.stripe_connect_status ?? 'not connected'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={cn('text-xs', t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                    {t.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/translators/${t.id}`} className="text-xs text-blue-600 hover:underline">View</Link>
                </td>
              </tr>
            ))}
            {(translators ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No translators yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
