'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function TranslatorDetailPage() {
  const { translatorId } = useParams<{ translatorId: string }>()
  const [translator, setTranslator] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [onboarding, setOnboarding] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('translators').select('*').eq('id', translatorId).single(),
      supabase.from('jobs').select('id, job_type, status, invoice_number, clients(contact_name)').eq('assigned_translator_id', translatorId).order('created_at', { ascending: false }).limit(20),
    ]).then(([{ data: t }, { data: j }]) => {
      setTranslator(t)
      setJobs(j ?? [])
    })
  }, [translatorId])

  async function handleConnect() {
    setOnboarding(true)
    const res = await fetch(`/api/admin/translators/${translatorId}/connect`, { method: 'POST' })
    const data = await res.json()
    if (data.onboardingUrl) {
      window.open(data.onboardingUrl, '_blank')
    } else {
      alert('Failed to create onboarding link.')
    }
    setOnboarding(false)
  }

  if (!translator) return <div className="p-8 text-gray-400">Loading…</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/translators" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-[#1a1a2e]">{translator.full_name}</h1>
        <Badge className={cn('text-xs', translator.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
          {translator.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold mb-3">Contact</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2"><dt className="text-gray-500 w-24">Email</dt><dd><a href={`mailto:${translator.email}`} className="text-blue-600">{translator.email}</a></dd></div>
            {translator.phone && <div className="flex gap-2"><dt className="text-gray-500 w-24">Phone</dt><dd>{translator.phone}</dd></div>}
          </dl>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold mb-3">Stripe Connect</h2>
          <div className="flex items-center gap-3 mb-3">
            <Badge className={cn('text-xs', {
              'bg-green-100 text-green-700': translator.stripe_connect_status === 'active',
              'bg-yellow-100 text-yellow-700': translator.stripe_connect_status === 'pending',
              'bg-gray-100 text-gray-500': !translator.stripe_connect_status,
            })}>
              {translator.stripe_connect_status ?? 'not connected'}
            </Badge>
          </div>
          <Button size="sm" variant="outline" onClick={handleConnect} disabled={onboarding}>
            {onboarding ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
            {translator.stripe_connect_id ? 'Update Stripe Account' : 'Connect Stripe Account'}
          </Button>
        </div>

        {(translator.language_pairs ?? []).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="font-semibold mb-3">Language Pairs</h2>
            <div className="flex flex-wrap gap-2">
              {translator.language_pairs.map((lp: string) => (
                <Badge key={lp} className="text-xs bg-blue-50 text-blue-700">{lp}</Badge>
              ))}
            </div>
          </div>
        )}

        {(translator.specialties ?? []).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="font-semibold mb-3">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {translator.specialties.map((s: string) => (
                <Badge key={s} className="text-xs bg-purple-50 text-purple-700">{s}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {jobs.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold">Assigned Jobs</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {jobs.map((j: any) => (
              <Link key={j.id} href={`/admin/jobs/${j.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 text-sm">
                <span className="text-gray-500">{j.invoice_number ?? j.id.slice(0, 8)}</span>
                <span className="flex-1 font-medium">{(j.clients as any)?.contact_name}</span>
                <span className="capitalize text-gray-500">{j.job_type.replace('_', ' ')}</span>
                <span className="capitalize text-gray-400">{j.status}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
