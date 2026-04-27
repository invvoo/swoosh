'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { Upload, CheckCircle, Loader2, FileText } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function TranslationRequestPage() {
  const [langPairs, setLangPairs] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({ clientName: '', clientEmail: '', clientPhone: '', clientCompany: '', sourceLang: '', targetLang: '', specialtyId: '' })
  const [preview, setPreview] = useState<{ amount: number; wordCount: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('language_pairs').select('id, source_lang, target_lang, per_word_rate').eq('is_active', true).order('source_lang').then(({ data }) => setLangPairs(data ?? []))
    supabase.from('specialty_multipliers').select('id, name, multiplier').eq('is_active', true).order('name').then(({ data }) => setSpecialties(data ?? []))
  }, [])

  // Unique source langs for first dropdown
  const sourceLangs = Array.from(new Set(langPairs.map((lp) => lp.source_lang))).sort()
  const targetLangsForSource = langPairs.filter((lp) => lp.source_lang === form.sourceLang)
  const selectedPair = langPairs.find((lp) => lp.source_lang === form.sourceLang && lp.target_lang === form.targetLang)
  const selectedSpecialty = specialties.find((s) => s.id === form.specialtyId)

  // Live quote preview via word count estimation (client-side heuristic; server confirms)
  useEffect(() => {
    if (!file || !selectedPair || !selectedSpecialty) { setPreview(null); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const fd = new FormData()
      fd.append('document', file)
      fd.append('clientName', form.clientName || 'Preview')
      fd.append('clientEmail', form.clientEmail || 'preview@example.com')
      fd.append('sourceLang', form.sourceLang)
      fd.append('targetLang', form.targetLang)
      fd.append('specialtyId', form.specialtyId)
      // Use the calculate endpoint for preview
      const res = await fetch('/api/quotes/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordCount: 100, // placeholder; will be overridden by server on submit
          languagePairId: selectedPair.id,
          specialtyId: form.specialtyId,
        }),
      })
      // We can't extract word count client-side easily, so just show rate info
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [file, form.sourceLang, form.targetLang, form.specialtyId])

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Please upload your document.'); return }
    setSubmitting(true)
    setError(null)

    const fd = new FormData()
    fd.append('document', file)
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })

    const res = await fetch('/api/jobs/translation', { method: 'POST', body: fd })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error?.formErrors?.[0] ?? 'Something went wrong. Please try again or call us.')
      setSubmitting(false)
    } else {
      setSuccess(true)
      setPreview({ amount: data.estimatedQuote, wordCount: data.wordCount })
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Request Received!</h2>
          {preview && (
            <p className="text-gray-600 mb-3">
              Your document has <strong>{preview.wordCount.toLocaleString()} words</strong>.
              Estimated quote: <strong>{formatCurrency(preview.amount)}</strong>
            </p>
          )}
          <p className="text-gray-500 text-sm mb-6">
            Our team will review your document and send you a formal quote by email shortly.
            You can accept and pay directly from the quote email.
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
          <h1 className="text-3xl font-bold text-[#1a1a2e]">Request a Translation</h1>
          <p className="text-gray-500 mt-2">Upload your document and get an instant quote estimate</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-8 space-y-6">
          {/* Contact Info */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Your Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Full Name *</Label>
                <Input required value={form.clientName} onChange={set('clientName')} placeholder="Jane Smith" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" required value={form.clientEmail} onChange={set('clientEmail')} placeholder="jane@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.clientPhone} onChange={set('clientPhone')} placeholder="(213) 555-0100" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Company (optional)</Label>
                <Input value={form.clientCompany} onChange={set('clientCompany')} />
              </div>
            </div>
          </div>

          {/* Language & Specialty */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Translation Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>From Language *</Label>
                <select required className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                  value={form.sourceLang} onChange={(e) => setForm((f) => ({ ...f, sourceLang: e.target.value, targetLang: '' }))}>
                  <option value="">Select…</option>
                  {sourceLangs.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>To Language *</Label>
                <select required className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                  value={form.targetLang} onChange={set('targetLang')} disabled={!form.sourceLang}>
                  <option value="">Select…</option>
                  {targetLangsForSource.map((lp) => <option key={lp.id} value={lp.target_lang}>{lp.target_lang}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Document Type *</Label>
                <select required className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                  value={form.specialtyId} onChange={set('specialtyId')}>
                  <option value="">Select…</option>
                  {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Upload Document</h2>
            <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'}`}>
              <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                {file ? (
                  <><FileText className="h-6 w-6 text-green-600" /><span className="text-green-700 font-medium">{file.name}</span><span className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</span></>
                ) : (
                  <><Upload className="h-6 w-6" /><span>Click to upload your document</span><span className="text-xs">Accepted: .docx, .pdf, .txt</span></>
                )}
              </div>
              <input type="file" className="hidden" accept=".docx,.doc,.pdf,.txt" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          {/* Rate preview */}
          {selectedPair && selectedSpecialty && (
            <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700">
              Rate: ${Number(selectedPair.per_word_rate).toFixed(4)}/word × {Number(selectedSpecialty.multiplier).toFixed(2)} ({selectedSpecialty.name}) multiplier.
              Final quote sent after our team reviews your document.
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Submit Translation Request'}
          </Button>

          <p className="text-xs text-center text-gray-400">
            By submitting, you agree to our terms. Our team typically responds within 2 business hours.
          </p>
        </form>
      </div>
    </div>
  )
}
