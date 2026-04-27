'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewTranslatorPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', language_pairs: '', specialties: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('translators').insert({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      language_pairs: form.language_pairs.split(',').map((s) => s.trim()).filter(Boolean),
      specialties: form.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      notes: form.notes || null,
    })
    if (err) {
      setError(err.message)
      setSubmitting(false)
    } else {
      router.push('/admin/translators')
    }
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/translators" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-[#1a1a2e]">Add Translator / Interpreter</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <Label>Full Name *</Label>
            <Input required value={form.full_name} onChange={set('full_name')} />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input type="email" required value={form.email} onChange={set('email')} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={set('phone')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Language Pairs (comma-separated)</Label>
          <Input placeholder="English→Spanish, Spanish→English" value={form.language_pairs} onChange={set('language_pairs')} />
        </div>

        <div className="space-y-1.5">
          <Label>Specialties (comma-separated)</Label>
          <Input placeholder="Legal, Medical, Technical" value={form.specialties} onChange={set('specialties')} />
        </div>

        <div className="space-y-1.5">
          <Label>Notes (internal)</Label>
          <Textarea rows={3} value={form.notes} onChange={set('notes')} />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Add Translator'}
        </Button>
      </form>
    </div>
  )
}
