'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ClientLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setStep('otp')
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    setLoading(false)
    if (err) {
      setError('Invalid or expired code. Please try again.')
    } else {
      router.push('/client/jobs')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="LA Translation" className="h-10 w-auto mx-auto mb-3" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Client Portal</h1>
          <p className="text-gray-500 text-sm mt-1">L.A. Translation &amp; Interpretation</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {step === 'email' ? (
            <>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mx-auto mb-5">
                <Mail className="h-5 w-5 text-[#1a1a2e]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 text-center mb-1">Sign in to your account</h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                Enter your email and we&apos;ll send you a one-time code — no password needed.
              </p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Send Code</>}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mx-auto mb-5">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 text-center mb-1">Check your email</h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp">One-time code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="text-center text-2xl tracking-widest"
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Sign In'}
                </Button>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setError(null) }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 text-center"
                >
                  Use a different email
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Are you a translator or interpreter?{' '}
          <Link href="/vendor/login" className="text-[#1a1a2e] underline">Vendor login →</Link>
        </p>
      </div>
    </div>
  )
}
