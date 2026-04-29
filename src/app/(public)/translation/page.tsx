'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { Upload, CheckCircle, Loader2, FileText, AlertCircle, CheckCircle2, Zap } from 'lucide-react'
import { calcTurnaroundDays, calculateRushFee } from '@/lib/quote/calculator'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ALL_LANGUAGES } from '@/lib/languages'

type CertificationType = 'none' | 'general' | 'court'

const CERT_OPTIONS: { value: CertificationType; label: string; description: string }[] = [
  { value: 'none', label: 'No Certification', description: 'Standard translation, no official certification needed' },
  { value: 'general', label: 'General / Company Certification', description: 'For USCIS, passport office, job applications, government agencies, or internal business use' },
  { value: 'court', label: 'Court Certification', description: 'For legal proceedings, court submissions, and litigation' },
]

const CERT_SPECIALTY: Record<CertificationType, string> = {
  none: 'General',
  general: 'Certified (USCIS)',
  court: 'Court Certified',
}

export default function TranslationRequestPage() {
  const [langPairs, setLangPairs] = useState<{ id: string; source_lang: string; target_lang: string; per_word_rate: number }[]>([])
  const [specialties, setSpecialties] = useState<{ name: string; multiplier: number }[]>([])
  const [minimums, setMinimums] = useState({ standard: 95, certified: 120, court: 275, courtPremium: 450 })
  const [courtPremiumLangs, setCourtPremiumLangs] = useState<string[]>(['Japanese', 'Hebrew'])

  // File + detection state
  const [file, setFile] = useState<File | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [detectedLang, setDetectedLang] = useState<string | null>(null)
  const [detectedConfidence, setDetectedConfidence] = useState(0)
  const [showManualSource, setShowManualSource] = useState(false)

  const [form, setForm] = useState({
    clientName: '', clientEmail: '', clientPhone: '', clientCompany: '',
    sourceLang: '',    // confirmed source (from detection or manual)
    targetLang: '',
    certificationTpe: 'none' as CertificationType,
  })

  const [rushEnabled, setRushEnabled] = useState(false)
  const [requestedDays, setRequestedDays] = useState<number | ''>('')

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successData, setSuccessData] = useState<{ wordCount: number; estimatedQuote: number | null; missingPricing: string | null } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('language_pairs').select('id, source_lang, target_lang, per_word_rate').eq('is_active', true)
      .then(({ data }) => setLangPairs(data ?? []))
    supabase.from('specialty_multipliers').select('name, multiplier').eq('is_active', true)
      .then(({ data }) => setSpecialties(data ?? []))
    supabase.from('system_settings').select('key, value')
      .in('key', [
        'translation_minimum_standard', 'translation_minimum_certified',
        'translation_minimum_court', 'translation_minimum_court_premium',
        'translation_court_premium_langs',
      ])
      .then(({ data }) => {
        if (!data) return
        const map = Object.fromEntries(data.map((s) => [s.key, s.value]))
        setMinimums({
          standard: Number(map['translation_minimum_standard'] ?? 95),
          certified: Number(map['translation_minimum_certified'] ?? 250),
          court: Number(map['translation_minimum_court'] ?? 550),
          courtPremium: Number(map['translation_minimum_court_premium'] ?? 750),
        })
        const premiumRaw = map['translation_court_premium_langs'] ?? 'Japanese,Hebrew'
        setCourtPremiumLangs(premiumRaw.split(',').map((l: string) => l.trim()))
      })
  }, [])

  const allTargetLangs = ALL_LANGUAGES.filter((lang) => lang !== form.sourceLang)
  const allSourceLangs = ALL_LANGUAGES

  // ── File selection + auto-detection ────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setDetectedLang(null)
    setDetectedConfidence(0)
    setShowManualSource(false)
    if (!selected) return

    setDetecting(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)
    try {
      const fd = new FormData()
      fd.append('document', selected)
      const res = await fetch('/api/jobs/translation/detect', { method: 'POST', body: fd, signal: controller.signal })
      const data = await res.json()
      const lang: string = data.language ?? 'Unknown'
      const conf: number = data.confidence ?? 0

      setDetectedLang(lang)
      setDetectedConfidence(conf)

      if (lang !== 'Unknown' && conf >= 0.7) {
        setForm((f) => ({ ...f, sourceLang: lang }))
        setShowManualSource(false)
      } else {
        setShowManualSource(true)
      }
    } catch {
      // Timeout or network error — fall back to manual source language
      setShowManualSource(true)
    } finally {
      clearTimeout(timeout)
      setDetecting(false)
    }
  }

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  // ── Client-side rate preview ────────────────────────────────────────────────

  function computePreview(): { perWordRate: number; minimum: number; isPivot: boolean } | null {
    if (!form.sourceLang || !form.targetLang) return null
    const specialty = specialties.find((s) => s.name === CERT_SPECIALTY[form.certificationTpe])
    if (!specialty) return null

    const isPremiumCourt =
      form.certificationTpe === 'court' &&
      courtPremiumLangs.some(
        (l) => l.toLowerCase() === form.sourceLang.toLowerCase() || l.toLowerCase() === form.targetLang.toLowerCase()
      )
    const minimum =
      form.certificationTpe === 'court'
        ? (isPremiumCourt ? minimums.courtPremium : minimums.court)
        : form.certificationTpe === 'general'
          ? minimums.certified
          : minimums.standard

    // Try direct pair
    const direct = langPairs.find(
      (lp) => lp.source_lang === form.sourceLang && lp.target_lang === form.targetLang
    )
    if (direct) {
      return { perWordRate: Number(direct.per_word_rate) * Number(specialty.multiplier), minimum, isPivot: false }
    }

    // Try pivot through English
    if (form.sourceLang !== 'English' && form.targetLang !== 'English') {
      const toEn = langPairs.find((lp) => lp.source_lang === form.sourceLang && lp.target_lang === 'English')
      const fromEn = langPairs.find((lp) => lp.source_lang === 'English' && lp.target_lang === form.targetLang)
      if (toEn && fromEn) {
        const rate = (Number(toEn.per_word_rate) + Number(fromEn.per_word_rate)) * Number(specialty.multiplier)
        return { perWordRate: rate, minimum, isPivot: true }
      }
    }
    return null  // pricing not available client-side
  }

  // ── Form submission ─────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Please upload your document.'); return }
    if (!form.sourceLang) { setError('Please confirm or select the source language.'); return }
    setSubmitting(true)
    setError(null)

    const fd = new FormData()
    fd.append('document', file)
    fd.append('clientName', form.clientName)
    fd.append('clientEmail', form.clientEmail)
    if (form.clientPhone) fd.append('clientPhone', form.clientPhone)
    if (form.clientCompany) fd.append('clientCompany', form.clientCompany)
    fd.append('targetLang', form.targetLang)
    fd.append('certificationTpe', form.certificationTpe)
    if (rushEnabled && requestedDays !== '') fd.append('requestedDeliveryDays', String(requestedDays))
    fd.append('detectedSourceLang', detectedLang ?? form.sourceLang)
    fd.append('detectedSourceLangConfidence', String(detectedConfidence))
    // For manual override or confirmation
    if (form.sourceLang !== detectedLang || showManualSource) {
      fd.append('sourceLang', form.sourceLang)
    }

    const res = await fetch('/api/jobs/translation', { method: 'POST', body: fd })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error?.formErrors?.[0] ?? data.error ?? 'Something went wrong. Please try again or call us.')
      setSubmitting(false)
    } else {
      setSuccessData({ wordCount: data.wordCount, estimatedQuote: data.estimatedQuote, missingPricing: data.missingPricing })
      setSuccess(true)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Request Received!</h2>
          {successData?.wordCount && (
            <p className="text-gray-600 mb-3">
              Your document has <strong>{successData.wordCount.toLocaleString()} words</strong>.
            </p>
          )}
          {successData?.missingPricing ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 mb-4 text-left">
              Our team will review your request and calculate a custom quote. You&apos;ll receive it by email shortly.
            </div>
          ) : successData?.estimatedQuote ? (
            <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700 mb-4">
              <p className="font-semibold">Estimated Quote: {formatCurrency(successData.estimatedQuote)}</p>
              <p className="text-xs mt-1">This is an estimate. Our team will review your document and send you a formal quote. Final pricing may be adjusted before you receive it.</p>
            </div>
          ) : null}
          <p className="text-gray-500 text-sm mb-4">
            We&apos;ll send you a formal quote by email. You can accept and pay directly from that email — no account needed.
          </p>
          <p className="text-xs text-gray-400">
            Typical response: 2 business hours &nbsp;·&nbsp; Questions? Call{' '}
            <a href="tel:2133857781" className="text-blue-600 font-medium">(213) 385-7781</a>
          </p>
        </div>
      </div>
    )
  }

  // ── Rate preview ────────────────────────────────────────────────────────────

  const preview = computePreview()

  // ── Main form ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/" className="text-[#1a1a2e] font-bold text-lg">L.A. Translation &amp; Interpretation</Link>
      </nav>

      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">Request a Translation</h1>
          <p className="text-gray-500 mt-2">Upload your document — we&apos;ll detect the language and give you an instant estimate</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-8 space-y-6">

          {/* Contact info */}
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

          {/* File upload */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-2">Upload Document</h2>
            <p className="text-xs text-gray-400 mb-3">We&apos;ll automatically detect the source language from your document.</p>
            <label
              className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
              }`}
            >
              <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                {file ? (
                  <><FileText className="h-6 w-6 text-green-600" />
                    <span className="text-green-700 font-medium">{file.name}</span>
                    <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</span></>
                ) : (
                  <><Upload className="h-6 w-6" />
                    <span>Click to upload your document</span>
                    <span className="text-xs">Accepted: .docx, .pdf, .txt</span></>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept=".docx,.doc,.pdf,.txt"
                onChange={handleFileChange} />
            </label>
          </div>

          {/* Language detection result */}
          {file && (
            <div>
              {detecting ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Detecting source language…
                </div>
              ) : detectedLang && !showManualSource ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Source language detected:</span>
                    <span className="text-[#1a1a2e] font-semibold">{detectedLang}</span>
                    <span className="text-xs text-gray-400">({Math.round(detectedConfidence * 100)}% confidence)</span>
                  </div>
                  <button type="button" onClick={() => setShowManualSource(true)}
                    className="text-xs text-blue-600 hover:underline">
                    Not right?
                  </button>
                </div>
              ) : null}

              {/* Manual source language override */}
              {(showManualSource || (!detecting && detectedLang === null)) && (
                <div className="space-y-1.5">
                  <Label>
                    {detectedLang && detectedLang !== 'Unknown'
                      ? `We detected ${detectedLang} — please confirm or select the correct language`
                      : 'Select the document\'s source language'}
                  </Label>
                  <select required
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                    value={form.sourceLang}
                    onChange={(e) => setForm((f) => ({ ...f, sourceLang: e.target.value }))}>
                    <option value="">Select…</option>
                    {allSourceLangs.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Target language */}
          {file && !detecting && (
            <div className="space-y-1.5">
              <Label>Translate into *</Label>
              <select required
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
                value={form.targetLang}
                onChange={(e) => setForm((f) => ({ ...f, targetLang: e.target.value }))}>
                <option value="">Select target language…</option>
                {allTargetLangs.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
          )}

          {/* Certification type */}
          {file && !detecting && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Certification Needed?</h2>
              <p className="text-xs text-gray-400 mb-3">Different certification levels have different pricing.</p>
              <div className="space-y-2">
                {CERT_OPTIONS.map((opt) => (
                  <label key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.certificationTpe === opt.value
                        ? 'border-[#1a1a2e] bg-[#1a1a2e]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input type="radio" name="certificationTpe" value={opt.value}
                      checked={form.certificationTpe === opt.value}
                      onChange={() => setForm((f) => ({ ...f, certificationTpe: opt.value }))}
                      className="mt-0.5 accent-[#1a1a2e]" />
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Turnaround + Rush fee */}
          {file && !detecting && form.certificationTpe && (() => {
            const standardDays = calcTurnaroundDays(100, form.certificationTpe) // placeholder, real calc needs word count
            return (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
                  <p className="font-medium text-gray-800 mb-0.5">Estimated Turnaround</p>
                  <p className="text-xs text-gray-500">
                    {form.certificationTpe === 'court' && 'Court certified: ~2,000 words/day'}
                    {form.certificationTpe === 'general' && 'Company certified: ~3,500 words/day'}
                    {form.certificationTpe === 'none' && 'Standard: ~5,000 words/day'}
                    {' — final turnaround calculated after we count your document words.'}
                  </p>
                </div>

                <div>
                  <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    rushEnabled ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="checkbox" className="mt-0.5 accent-orange-500"
                      checked={rushEnabled}
                      onChange={(e) => { setRushEnabled(e.target.checked); if (!e.target.checked) setRequestedDays('') }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-orange-500" />
                        <p className="font-medium text-sm text-gray-900">Rush Delivery</p>
                        <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">+20% per day rushed</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Need it sooner? We&apos;ll prioritize your job.</p>
                    </div>
                  </label>

                  {rushEnabled && (
                    <div className="mt-2 pl-3 space-y-1.5">
                      <Label className="text-xs">How many business days do you need it in?</Label>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        placeholder="e.g. 2"
                        value={requestedDays}
                        onChange={(e) => setRequestedDays(e.target.value ? parseInt(e.target.value) : '')}
                        className="max-w-[120px]"
                      />
                      {requestedDays !== '' && (
                        <p className="text-xs text-orange-600 font-medium">
                          Rush fee will be calculated after we count your word count. Final quote includes the surcharge.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Rate preview */}
          {form.sourceLang && form.targetLang && file && !detecting && (() => {
            if (preview) {
              const est250 = Math.max(Math.ceil(250 * preview.perWordRate * 100) / 100, preview.minimum)
              const est500 = Math.max(Math.ceil(500 * preview.perWordRate * 100) / 100, preview.minimum)
              const est1000 = Math.max(Math.ceil(1000 * preview.perWordRate * 100) / 100, preview.minimum)
              return (
                <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700 space-y-1.5">
                  <p className="font-semibold text-blue-800">Estimated Pricing</p>
                  <p>${preview.perWordRate.toFixed(4)}/word{preview.isPivot ? ' (via English pivot)' : ''}</p>
                  <p className="text-blue-600">Minimum: {formatCurrency(preview.minimum)}</p>
                  <div className="text-xs text-blue-500 pt-0.5 space-y-0.5">
                    <p>≈ 250 words → {formatCurrency(est250)}</p>
                    <p>≈ 500 words → {formatCurrency(est500)}</p>
                    <p>≈ 1,000 words → {formatCurrency(est1000)}</p>
                  </div>
                  <p className="text-xs text-blue-400 pt-0.5">
                    Estimate based on word count from your document. Our team reviews before sending the final quote.
                  </p>
                </div>
              )
            }
            return (
              <div className="flex items-start gap-2 bg-amber-50 rounded-lg px-4 py-3 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>We don&apos;t have standard pricing for this language pair on file. Our team will review and provide a custom quote.</p>
              </div>
            )
          })()}

          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={submitting || detecting}>
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Submit Translation Request'}
          </Button>

          <p className="text-xs text-center text-gray-400">
            Our team reviews every request before sending a formal quote. You&apos;ll accept and pay from the quote email — no account required.
          </p>
        </form>
      </div>
    </div>
  )
}
