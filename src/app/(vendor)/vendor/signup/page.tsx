'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogoImage } from '@/components/logo-image'
import { Button } from '@/components/ui/button'
import {
  Loader2, CheckCircle2, Zap, DollarSign, ShieldCheck,
  FileText, Upload, Send, CreditCard, ChevronRight, Star,
} from 'lucide-react'

const VENDOR_TYPES = [
  { value: 'translator', label: 'Translator' },
  { value: 'interpreter', label: 'Interpreter' },
  { value: 'both', label: 'Translator & Interpreter' },
  { value: 'notary', label: 'Notary / Apostille Agent' },
  { value: 'other', label: 'Other' },
]

const SPECIALTIES = ['Legal', 'Medical', 'Technical', 'Financial', 'General', 'Court Certified', 'USCIS / Immigration']

const WORKFLOW_STEPS = [
  { icon: FileText,   label: 'Job assigned',    sub: 'Email + calendar invite' },
  { icon: Upload,     label: 'Submit work',      sub: 'One-click file upload'   },
  { icon: Send,       label: 'Submit invoice',   sub: 'Enter amount, one click' },
  { icon: CreditCard, label: 'Get paid',         sub: 'Net-30 via direct deposit' },
]

function WorkflowDemo() {
  const [activeStep, setActiveStep] = useState(0)
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Step tabs */}
      <div className="flex border-b border-gray-100">
        {WORKFLOW_STEPS.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveStep(i)}
            className={`flex-1 py-3 text-xs font-medium transition-colors ${activeStep === i ? 'bg-[#1a1a2e] text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {i + 1}. {s.label.split(' ')[0]}
          </button>
        ))}
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-[#1a1a2e] transition-all duration-500"
          style={{ width: `${((activeStep + 1) / WORKFLOW_STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step content */}
      <div className="p-5 min-h-[200px]">
        {activeStep === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Step 1 — You receive a job</p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">New Assignment — Spanish → English</p>
                  <p className="text-xs text-gray-500 mt-0.5">Legal document · 1,240 words · Due Jan 15</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-[#1a1a2e] text-white text-xs px-3 py-1 rounded-full">
                    <span>PO-20250115-0012</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Email notification</p>
                <p className="text-xs font-medium text-gray-700 mt-0.5">+ calendar .ics invite</p>
              </div>
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Portal access</p>
                <p className="text-xs font-medium text-gray-700 mt-0.5">Documents ready to download</p>
              </div>
            </div>
            <button type="button" onClick={() => setActiveStep(1)} className="w-full text-xs text-[#1a1a2e] font-medium flex items-center justify-center gap-1 mt-1">Next step <ChevronRight className="h-3 w-3" /></button>
          </div>
        )}

        {activeStep === 1 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Step 2 — Submit your work</p>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#1a1a2e] transition-colors cursor-pointer group">
              <Upload className="h-8 w-8 text-gray-300 group-hover:text-[#1a1a2e] mx-auto mb-2 transition-colors" />
              <p className="text-sm font-medium text-gray-700">Click to upload completed translation</p>
              <p className="text-xs text-gray-400 mt-0.5">.docx · .pdf · .txt</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Translation submitted — coordinator will review shortly.
            </div>
            <button type="button" onClick={() => setActiveStep(2)} className="w-full text-xs text-[#1a1a2e] font-medium flex items-center justify-center gap-1 mt-1">Next step <ChevronRight className="h-3 w-3" /></button>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Step 3 — Submit your invoice</p>
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Invoice amount</p>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  <span className="text-gray-400 text-sm mr-1">$</span>
                  <span className="text-sm font-mono font-semibold text-gray-900">99.20</span>
                  <span className="text-xs text-gray-400 ml-auto">1,240 words × $0.08</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Note (optional)</p>
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400">Rush delivery applied…</div>
              </div>
              <div className="bg-[#1a1a2e] text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2">
                <Send className="h-3.5 w-3.5" /> Submit Invoice
              </div>
            </div>
            <button type="button" onClick={() => setActiveStep(3)} className="w-full text-xs text-[#1a1a2e] font-medium flex items-center justify-center gap-1 mt-1">Next step <ChevronRight className="h-3 w-3" /></button>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Step 4 — Get paid</p>
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Invoice #INV-2025-0042</span>
                <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Approved</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">$99.20</span>
                <span className="text-xs text-gray-400">Due Jan 30, 2025</span>
              </div>
              {/* Payment progress */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Payment status</span>
                  <span>Queued for transfer</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-green-500 rounded-full" />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-green-700">
                <CreditCard className="h-4 w-4 shrink-0" />
                Direct deposit to your bank account — net 30 days from approval
              </div>
            </div>
            <button type="button" onClick={() => setActiveStep(0)} className="w-full text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">↩ Start over</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VendorSignupPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    vendorType: 'translator',
    languagePairs: '',
    specialties: [] as string[],
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="inline-block">
          <LogoImage className="h-8 w-auto" />
        </Link>
        <Link href="/vendor/login" className="text-sm text-[#1a1a2e] font-medium hover:underline">
          Sign in →
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-[#1a1a2e]/5 text-[#1a1a2e] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Star className="h-3 w-3 fill-[#1a1a2e]" /> 2,000+ translators &amp; interpreters in our network
          </div>
          <h1 className="text-4xl font-bold text-[#1a1a2e] mb-3">Work With L.A. Translation</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Steady assignments, fast pay, and a simple portal that handles everything from job details to invoicing.
          </p>
        </div>

        {/* Benefits row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            {
              icon: Zap,
              color: 'bg-blue-50 text-blue-600',
              title: 'Consistent work',
              body: 'Receive assignments matched to your language pairs and specialties. We\'ve been placing translators since 2003.',
            },
            {
              icon: DollarSign,
              color: 'bg-green-50 text-green-600',
              title: 'Reliable payment',
              body: 'Submit your invoice in one click. Payment processed within 30 days of approval — directly to your bank account.',
            },
            {
              icon: ShieldCheck,
              color: 'bg-purple-50 text-purple-600',
              title: 'Professional clients',
              body: 'Work with UCLA, the FBI, LA Superior Court, CBS, DreamWorks, and hundreds of law firms and hospitals.',
            },
          ].map(({ icon: Icon, color, title, body }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${color} mb-4`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Main two-column: demo + form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: interactive workflow demo */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-1">See how it works</h2>
              <p className="text-sm text-gray-500">Click through each step to see how simple the portal is.</p>
            </div>

            <WorkflowDemo />

            {/* Quick facts */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '30 days', label: 'Max payment turnaround' },
                { value: '200+', label: 'Languages supported' },
                { value: '20+ yrs', label: 'In business since 2003' },
                { value: '1 click', label: 'To submit an invoice' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-[#1a1a2e]">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#1a1a2e] text-white rounded-2xl p-5">
              <p className="text-sm font-semibold mb-1">How payment works</p>
              <ol className="space-y-2 text-sm text-white/80">
                {[
                  'Submit your invoice from the vendor portal after delivery',
                  'Our coordinator reviews and approves within 1–2 business days',
                  'Payment is deposited directly to your bank within 30 days',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right: application form */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-1">Apply to join</h2>
              <p className="text-sm text-gray-500 mb-6">Translators, interpreters &amp; service providers welcome.</p>

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

                <p className="text-xs text-center text-gray-400">
                  Already have an account?{' '}
                  <Link href="/vendor/login" className="text-[#1a1a2e] underline">Sign in →</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
