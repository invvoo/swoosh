'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, DollarSign, X } from 'lucide-react'

const METHODS = [
  { value: 'cash',   label: 'Cash'          },
  { value: 'check',  label: 'Check'         },
  { value: 'zelle',  label: 'Zelle'         },
  { value: 'venmo',  label: 'Venmo'         },
  { value: 'wire',   label: 'Wire Transfer' },
  { value: 'other',  label: 'Other'         },
]

interface Props {
  jobId: string
  currentStatus: string
}

export function ManualPaymentButton({ jobId, currentStatus }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState('cash')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/jobs/${jobId}/manual-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, note: note || undefined }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error ?? 'Failed to record payment.')
      return
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-green-300 text-green-700 hover:bg-green-50"
        onClick={() => setOpen(true)}
      >
        <DollarSign className="h-3.5 w-3.5 mr-1" />
        Record Manual Payment
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">Record Manual Payment</h2>
                <p className="text-xs text-gray-500 mt-0.5">For cash, check, Zelle, or any in-person payment</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment method</label>
                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMethod(m.value)}
                      className={`text-xs py-2 px-2 rounded-lg border transition-colors ${method === m.value ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]"
                  placeholder="Check #1234, reference number, etc."
                />
              </div>

              {error && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-700 hover:bg-green-800"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Payment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
