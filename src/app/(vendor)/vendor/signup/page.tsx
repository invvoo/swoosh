'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogoImage } from '@/components/logo-image'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react'

const TRANSLATOR_CERTS = [
  { id: 'ata',       label: 'ATA Certified',                     description: 'American Translators Association' },
  { id: 'court',     label: 'Court Certified',                    description: 'State or federally court-certified interpreter' },
  { id: 'cchi',      label: 'CCHI Certified',                     description: 'Certification Commission for Healthcare Interpreters' },
  { id: 'nb',        label: 'National Board Certified',           description: 'National Board of Certification for Medical Interpreters' },
  { id: 'atio',      label: 'ATIO Member',                        description: 'Association of Translators and Interpreters of Ontario' },
  { id: 'doj',       label: 'DOJ / Federal Court Certified',      description: 'U.S. Department of Justice certified' },
  { id: 'sworn',     label: 'Sworn Translator',                   description: 'Government-authorized sworn translation' },
  { id: 'notary',    label: 'Notary Public',                      description: 'Commissioned notary public' },
]

const VENDOR_TYPES = [
  { value: 'translator', label: 'Translator' },
  { value: 'interpreter', label: 'Interpreter' },
  { value: 'both', label: 'Translator & Interpreter' },
  { value: 'notary', label: 'Notary / Apostille Agent' },
  { value: 'other', label: 'Other' },
]

const SPECIALTIES = ['Legal', 'Medical', 'Technical', 'Financial', 'General', 'Court Certified', 'USCIS / Immigration']

export default function VendorSignupPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    vendorType: 'translator',
    languagePairs: '',
    specialties: [] as string[],
    certifications: [] as string[],
    perWordRate: '',
    hourlyRate: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function toggleSpecialty(s: string) {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s) ? f.specialties.filter((x) => x !== s) : [...f.specialties, s],
    }))
  }

  function toggleCert(id: string) {
    setForm((f) => ({
      ...f,
      certifications: f.certifications.includes(id) ? f.certifications.filter((x) => x !== id) : [...f.certifications, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/vendor/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || undefined,
          vendorType: form.vendorType,
          languagePairs: form.languagePairs || undefined,
          specialties: form.specialties.length > 0 ? form.specialties : undefined,
          certifications: form.certifications.length > 0 ? form.certifications : undefined,
          perWordRate: form.perWordRate ? parseFloat(form.perWordRate) : undefined,
          hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
          notes: form.notes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to submit application. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Application Submitted</h1>
          <p className="text-gray-500 text-sm mb-6">
            Thank you for applying to work with L.A. Translation &amp; Interpretation.
            Our team will review your application and contact you within 1–2 business days.
          </p>
          <Link href="/vendor/login">
            <Button variant="outline" className="w-full">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <LogoImage className="h-10 w-auto mx-auto mb-3" />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Apply as a Vendor</h1>
          <p className="text-gray-500 text-sm mt-1">Translators, Interpreters &amp; Service Providers</p>

          {/* Benefits link */}
          <Link
            href="/vendor/benefits"
            className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-600 font-medium hover:underline"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Benefits of using this platform
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text" required value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]"
                placeholder="jane@example.com"
              />
              <p className="text-xs text-gray-400 mt-1">Use the same email you will sign in with (Google).</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel" value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]"
                placeholder="(213) 555-0100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a… <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {VENDOR_TYPES.map(({ value, label }) => (
                  <button
                    key={value} type="button"
                    onClick={() => setForm((f) => ({ ...f, vendorType: value }))}
                    className={`text-sm px-3 py-2 rounded-lg border text-left transition-colors ${form.vendorType === value ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {['translator', 'interpreter', 'both'].includes(form.vendorType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                <input
                  type="text" value={form.languagePairs}
                  onChange={(e) => setForm((f) => ({ ...f, languagePairs: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]"
                  placeholder="e.g. English, Spanish, French, Chinese"
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated list of languages you work with.</p>
              </div>
            )}

            {['translator', 'both'].includes(form.vendorType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Per-Word Rate (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number" min="0.01" step="0.001" value={form.perWordRate}
                    onChange={(e) => setForm((f) => ({ ...f, perWordRate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]"
                    placeholder="0.08"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Your rate per source word for translation work.</p>
              </div>
            )}

            {['interpreter', 'both', 'notary', 'other'].includes(form.vendorType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number" min="1" step="1" value={form.hourlyRate}
                    onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]"
                    placeholder="75"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Your rate per hour.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => (
                  <button
                    key={s} type="button" onClick={() => toggleSpecialty(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.specialties.includes(s) ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certifications &amp; Credentials</label>
              <p className="text-xs text-gray-400 mb-2">Select all that apply.</p>
              <div className="grid grid-cols-1 gap-2">
                {TRANSLATOR_CERTS.map(({ id, label, description }) => (
                  <label
                    key={id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.certifications.includes(id) ? 'border-[#1a1a2e] bg-[#1a1a2e]/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.certifications.includes(id)}
                      onChange={() => toggleCert(id)}
                      className="mt-0.5 accent-[#1a1a2e]"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400">{description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brief Introduction</label>
              <textarea
                rows={3} value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e] resize-none"
                placeholder="Years of experience, certifications, relevant background…"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <Button type="submit" className="w-full bg-[#1a1a2e] hover:bg-[#2a2a4e]" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting…</> : 'Submit Application'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/vendor/login" className="text-[#1a1a2e] underline">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
