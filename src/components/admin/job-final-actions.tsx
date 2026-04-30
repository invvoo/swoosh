'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface Props {
  jobId: string
  status: string
  adminName: string
  jobType?: string
}

const FINAL_STATUSES = ['complete', 'cancelled']

// For translations, only allow Mark Complete after delivered
function canMarkComplete(jobType: string | undefined, status: string): boolean {
  if (jobType === 'translation') return status === 'delivered'
  return !FINAL_STATUSES.includes(status)
}

export function JobFinalActions({ jobId, status, adminName, jobType }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState<'complete' | 'delete' | null>(null)
  const [loading, setLoading] = useState(false)

  if (FINAL_STATUSES.includes(status)) return null

  const showComplete = canMarkComplete(jobType, status)

  async function markComplete() {
    setLoading(true)
    await fetch(`/api/admin/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'complete',
        note: `Marked complete by ${adminName}`,
      }),
    })
    setLoading(false)
    setConfirming(null)
    router.refresh()
  }

  async function deleteJob() {
    setLoading(true)
    await fetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' })
    router.push('/admin/jobs')
  }

  if (confirming === 'complete') {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
        <p className="text-sm text-green-800 mr-1">Mark this job as complete and archive it?</p>
        <Button size="sm" onClick={markComplete} disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Yes, Complete'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(null)} disabled={loading}>
          Cancel
        </Button>
      </div>
    )
  }

  if (confirming === 'delete') {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
        <p className="text-sm text-red-800 mr-1">Permanently delete this job? This cannot be undone.</p>
        <Button size="sm" onClick={deleteJob} disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Yes, Delete'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(null)} disabled={loading}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <>
      {showComplete && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setConfirming('complete')}
          className="border-green-300 text-green-700 hover:bg-green-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Complete
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setConfirming('delete')}
        className="border-red-300 text-red-700 hover:bg-red-50"
      >
        <XCircle className="h-3.5 w-3.5 mr-1" /> Not Proceeding
      </Button>
    </>
  )
}
