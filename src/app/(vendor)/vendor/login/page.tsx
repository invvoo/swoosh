'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function VendorLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    if (authErr) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }
    router.push('/vendor/jobs')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="LA Translation" className="h-10 w-auto mx-auto mb-3" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Vendor Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Translators &amp; Interpreters</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-[#f0f0f8] rounded-full mx-auto mb-5">
            <Briefcase className="h-5 w-5 text-[#1a1a2e]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 text-center mb-5">Sign in</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-4">
            Contact your coordinator if you need access or a password reset.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Are you a client?{' '}
          <Link href="/client/login" className="text-[#1a1a2e] underline">Client portal →</Link>
        </p>
      </div>
    </div>
  )
}
