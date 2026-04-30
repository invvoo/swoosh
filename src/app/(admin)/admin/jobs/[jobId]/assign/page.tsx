'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AssignPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const router = useRouter()
  const [translators, setTranslators] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    createClient()
      .from('translators')
      .select('id, full_name, email, language_pairs, specialties, court_certified, medical_certified, does_consecutive, does_simultaneous')
      .eq('is_active', true)
      .order('full_name')
      .then(({ data }) => setTranslators(data ?? []))
  }, [])

  async function handleAssign() {
    if (!selectedId) return alert('Please select a translator.')
    setSubmitting(true)
    const res = await fetch(`/api/admin/jobs/${jobId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ translatorId: selectedId, deadlineAt: deadline || undefined }),
    })
    if (res.ok) {
      router.push(`/admin/jobs/${jobId}`)
    } else {
      alert('Failed to assign. Check logs.')
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/jobs/${jobId}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-[#1a1a2e]">Assign Translator / Interpreter</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div className="space-y-1.5">
          <Label>Select Translator</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {translators.map((t) => (
              <label key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedId === t.id ? 'border-[#1a1a2e] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="translator" value={t.id} checked={selectedId === t.id} onChange={() => setSelectedId(t.id)} className="mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{t.full_name}</p>
                  <p className="text-xs text-gray-400">{t.email}</p>
                  {t.language_pairs?.length > 0 && (
                    <p className="text-xs text-gray-400">{t.language_pairs.slice(0, 4).join(', ')}{t.language_pairs.length > 4 ? '…' : ''}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {t.court_certified && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Court</span>}
                    {t.medical_certified && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Medical</span>}
                    {t.does_simultaneous && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">Simultaneous</span>}
                    {t.does_consecutive && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">Consecutive</span>}
                  </div>
                </div>
              </label>
            ))}
            {translators.length === 0 && <p className="text-sm text-gray-400">No active translators found. <Link href="/admin/translators/new" className="text-blue-600 hover:underline">Add one.</Link></p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Deadline (optional)</Label>
          <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>

        <Button onClick={handleAssign} disabled={submitting || !selectedId} className="w-full">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Assigning…</> : 'Assign Translator'}
        </Button>
      </div>
    </div>
  )
}
