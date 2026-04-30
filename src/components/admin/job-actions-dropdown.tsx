'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, ExternalLink, CheckCircle2, Trash2, Loader2 } from 'lucide-react'

interface Props {
  jobId: string
  status: string
  jobType?: string
  /** Where to redirect after delete. Defaults to /admin/jobs */
  afterDelete?: string
}

const FINAL = ['complete', 'cancelled']

export function JobActionsDropdown({ jobId, status, jobType, afterDelete = '/admin/jobs' }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState<'complete' | 'delete' | null>(null)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Translations can only be marked complete after delivery
  const canMarkComplete = jobType === 'translation' ? status === 'delivered' : !FINAL.includes(status)

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirming(null)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function stopProp(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  async function markComplete(e: React.MouseEvent) {
    stopProp(e)
    setLoading(true)
    await fetch(`/api/admin/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'complete', note: 'Marked complete' }),
    })
    setLoading(false)
    setOpen(false)
    setConfirming(null)
    router.refresh()
  }

  async function deleteJob(e: React.MouseEvent) {
    stopProp(e)
    setLoading(true)
    await fetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' })
    router.push(afterDelete)
  }

  const isFinal = FINAL.includes(status)

  return (

    <div ref={ref} className="relative" onClick={stopProp}>
      <button
        onClick={(e) => { stopProp(e); setOpen((o) => !o); setConfirming(null) }}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Job actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-52 bg-white rounded-lg border border-gray-200 shadow-lg py-1 text-sm">
          {confirming === 'complete' ? (
            <div className="px-3 py-2 space-y-2">
              <p className="text-gray-700 text-xs font-medium">Mark this job complete and archive it?</p>
              <div className="flex gap-2">
                <button
                  onClick={markComplete}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white rounded px-2 py-1 text-xs font-medium"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                </button>
                <button
                  onClick={(e) => { stopProp(e); setConfirming(null) }}
                  className="flex-1 text-center border border-gray-200 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : confirming === 'delete' ? (
            <div className="px-3 py-2 space-y-2">
              <p className="text-gray-700 text-xs font-medium">Permanently delete this job?</p>
              <div className="flex gap-2">
                <button
                  onClick={deleteJob}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white rounded px-2 py-1 text-xs font-medium"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Delete'}
                </button>
                <button
                  onClick={(e) => { stopProp(e); setConfirming(null) }}
                  className="flex-1 text-center border border-gray-200 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={(e) => { stopProp(e); router.push(`/admin/jobs/${jobId}`) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-gray-700"
              >
                <ExternalLink className="h-3.5 w-3.5 text-gray-400" /> View Details
              </button>
              {!isFinal && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  {canMarkComplete && (
                    <button
                      onClick={(e) => { stopProp(e); setConfirming('complete') }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-green-50 text-green-700"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Complete
                    </button>
                  )}
                  <button
                    onClick={(e) => { stopProp(e); setConfirming('delete') }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Not Proceeding
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
