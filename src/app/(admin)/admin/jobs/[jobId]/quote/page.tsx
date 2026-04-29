'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function QuoteReviewPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [adjustedAmount, setAdjustedAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('jobs')
      .select('id, job_type, status, source_lang, target_lang, word_count, quote_amount, quote_adjusted_amount, quote_per_word_rate, quote_multiplier, employee_notes, clients(contact_name, email), specialty_multipliers:specialty_id(name)')
      .eq('id', jobId)
      .single()
      .then(({ data }) => {
        if (data) {
          setJob(data)
          setAdjustedAmount(String(data.quote_adjusted_amount ?? data.quote_amount ?? ''))
          setNote(data.employee_notes ?? '')
        }
      })
  }, [jobId])

  async function handleAdjust() {
    setSaving(true)
    await fetch(`/api/admin/jobs/${jobId}/quote`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustedAmount: parseFloat(adjustedAmount), note }),
    })
    setSaving(false)
    alert('Quote saved.')
  }

  const [sendError, setSendError] = useState<string | null>(null)

  async function handleSend() {
    if (!confirm(`Send quote for ${formatCurrency(parseFloat(adjustedAmount || '0'))} to ${(job?.clients as any)?.email}?`)) return
    setSending(true)
    setSendError(null)
    const res = await fetch(`/api/admin/jobs/${jobId}/quote`, { method: 'POST' })
    if (res.ok) {
      router.push(`/admin/jobs/${jobId}`)
    } else {
      const body = await res.json().catch(() => ({}))
      setSendError(body.error ?? `Server error (${res.status})`)
      setSending(false)
    }
  }

  if (!job) return <div className="p-8 text-gray-400">Loading…</div>

  const client = job.clients as any
  const specialty = job.specialty_multipliers as any
  const baseAmount = Number(job.quote_amount)

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/jobs/${jobId}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-[#1a1a2e]">Review &amp; Send Quote</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quote Breakdown</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Client</dt><dd>{client?.contact_name} &lt;{client?.email}&gt;</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Languages</dt><dd>{job.source_lang} → {job.target_lang}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Specialty</dt><dd>{specialty?.name}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Word Count</dt><dd>{job.word_count?.toLocaleString()} words</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Rate per Word</dt><dd>${Number(job.quote_per_word_rate).toFixed(4)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Multiplier</dt><dd>{Number(job.quote_multiplier).toFixed(2)}×</dd></div>
          <div className="flex justify-between font-semibold border-t border-gray-100 pt-2">
            <dt>Calculated Amount</dt>
            <dd>{formatCurrency(baseAmount)}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Adjust &amp; Send</h2>

        <div className="space-y-1.5">
          <Label>Final Quote Amount</Label>
          <div className="flex gap-2 items-center">
            <span className="text-gray-500">$</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={adjustedAmount}
              onChange={(e) => setAdjustedAmount(e.target.value)}
              className="max-w-[160px]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Internal Note (optional)</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Notes visible only to staff…"
          />
        </div>

        {sendError && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 font-mono break-all">
            {sendError}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleAdjust} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Draft'}
          </Button>
          <Button onClick={handleSend} disabled={sending || !adjustedAmount}>
            {sending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
            ) : (
              <><Send className="h-4 w-4" /> Send Quote to Client</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
