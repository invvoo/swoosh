'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const INTERPRETATION_TYPES = [
  { value: 'in_person', label: 'In-Person' },
  { value: 'phone', label: 'Phone' },
  { value: 'video', label: 'Video / Remote' },
]

export default function InterpretationRequestPage() {
  const [langPairs, setLangPairs] = useState<any[]>([])
  const [form, setForm] = useState({
    clientName: '', clientEmail: '', clientPhone: '', clientCompany: '',
    sourceLang: '', targetLang: '', scheduledAt: '', durationMinutes: '60',
    locationType: 'in_person', locationDetails: '', interpreterNotes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estimatedQuote, setEstimatedQuote] = useState<{ amount: number; billedMinutes: number } | null>(null)

  useEffect(() => {
    createClient().from('language_pairs').select('id, source_lang, target_lang').eq('is_active', true).order('source_lang')
      .then(({ data }) => setLangPairs(data ?? []))
  }, [])

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const allLanguages = Array.from(
    new Set([...langPairs.map((lp) => lp.source_lang), ...langPairs.map((lp) => lp.target_lang)])
  ).sort()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const res = await fetch('/api/jobs/interpretation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: form.clientName, clientEmail: form.clientEmail,
        clientPhone: form.clientPhone || undefined, clientCompany: form.clientCompany || undefined,
        sourceLang: form.sourceLang, targetLang: form.targetLang,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
        durationMinutes: parseInt(form.durationMinutes, 10),
        locationType: form.locationType,
        locationDetails: form.locationDetails || undefined,
        interpreterNotes: form.interpreterNotes || undefined,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setEstimatedQuote({ amount: data.estimatedQuote, billedMinutes: data.billedMinutes })
      setSuccess(true)
    } else {
      setError('Something went wrong. Please call us at (213) 385-7781.')
      setSubmitting(false)
    }
  }

  if (success) {
    const requestedMinutes = parseInt(form.durationMinutes, 10)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Request Received!</h2>
          <p className="text-gray-500 text-sm mb-4">
            We received your interpretation request.
          </p>

          {estimatedQuote && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 text-left">
              <p className="text-blue-800 font-semibold text-base">
                Estimated quote: ${estimatedQuote.amount.toFixed(2)}
              </p>
              {estimatedQuote.billedMinutes !== requestedMinutes && (
                <p className="text-blue-600 text-sm mt-1">
                  Based on {estimatedQuote.billedMinutes} minutes (3-hour minimum applies)
                </p>
              )}
            </div>
          )}

          <p className="text-gray-500 text-sm mb-6">
            This is an estimate. Our team will confirm availability and send you a formal quote.
          </p>

          <p className="text-sm text-gray-500">
            Questions? Call <a href="tel:2133857781" className="text-blue-600 font-medium">(213) 385-7781</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/" className="text-[#1a1a2e] font-bold text-lg">L.A. Translation &amp; Interpretation</Link>
      </nav>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">Request an Interpreter</h1>
          <p className="text-gray-500 mt-2">Court · Medical · Business · Simultaneous · Escort</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-8 space-y-6">
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Your Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Full Name *</Label>
                <Input required value={form.clientName} onChange={set('clientName')} />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" required value={form.clientEmail} onChange={set('clientEmail')} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.clientPhone} onChange={set('clientPhone')} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Organization / Company</Label>
                <Input value={form.clientCompany} onChange={set('clientCompany')} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Interpreting Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Language From *</Label>
                <select required className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                  value={form.sourceLang} onChange={(e) => setForm((f) => ({ ...f, sourceLang: e.target.value, targetLang: '' }))}>
                  <option value="">Select…</option>
                  {allLanguages.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Language To *</Label>
                <select required className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                  value={form.targetLang} onChange={set('targetLang')}>
                  <option value="">Select…</option>
                  {allLanguages.filter((lang) => lang !== form.sourceLang).map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Date &amp; Time</Label>
                <Input type="datetime-local" value={form.scheduledAt} onChange={set('scheduledAt')} />
              </div>
              <div className="space-y-1.5">
                <Label>Duration (minutes)</Label>
                <Input type="number" min="30" value={form.durationMinutes} onChange={set('durationMinutes')} />
              </div>
              <div className="space-y-1.5">
                <Label>Format *</Label>
                <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                  value={form.locationType} onChange={set('locationType')}>
                  {INTERPRETATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Location / Address</Label>
                <Input value={form.locationDetails} onChange={set('locationDetails')} placeholder="Address, court name, or meeting link" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Additional Notes</Label>
            <Textarea rows={3} value={form.interpreterNotes} onChange={set('interpreterNotes')}
              placeholder="Type of proceeding, subject matter, any special requirements…" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Submit Interpretation Request'}
          </Button>

          <p className="text-xs text-center text-gray-400">
            Rates vary by language, date, and location. We will confirm availability and send a quote by email.
          </p>
        </form>
      </div>
    </div>
  )
}
