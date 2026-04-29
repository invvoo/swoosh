'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, Loader2, CheckCircle, FileText } from 'lucide-react'
import Link from 'next/link'

export default function DeliverPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [hasVendorSubmission, setHasVendorSubmission] = useState(false)
  const [useVendor, setUseVendor] = useState(false)

  useEffect(() => {
    // Check if a vendor has submitted a translation for this job
    fetch(`/api/admin/jobs/${jobId}/vendor-submission-check`)
      .then(async (r) => {
        if (r.ok) {
          const d = await r.json()
          if (d.hasSubmission) {
            setHasVendorSubmission(true)
            setUseVendor(true)
          }
        }
      })
      .catch(() => {})
  }, [jobId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    if (useVendor) {
      // Deliver using the existing vendor submission
      const res = await fetch(`/api/admin/jobs/${jobId}/deliver-vendor`, { method: 'POST' })
      if (res.ok) {
        router.push(`/admin/jobs/${jobId}`)
      } else {
        const d = await res.json().catch(() => ({}))
        alert(d.error ?? 'Failed. Please try again.')
        setSubmitting(false)
      }
      return
    }

    if (!file) { setSubmitting(false); return }
    const formData = new FormData()
    formData.append('translatedFile', file)
    const res = await fetch(`/api/admin/jobs/${jobId}/deliver`, { method: 'POST', body: formData })
    if (res.ok) {
      router.push(`/admin/jobs/${jobId}`)
    } else {
      alert('Upload failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/jobs/${jobId}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-[#1a1a2e]">Upload &amp; Deliver to Client</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-500 mb-5">
          This will trigger the delivery email to the client with a secure 30-day download link.
        </p>

        {/* Vendor submission option */}
        {hasVendorSubmission && (
          <div className="mb-5 space-y-2">
            <Label className="text-sm font-medium text-gray-700">Source</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUseVendor(true)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${useVendor ? 'border-[#1a1a2e] bg-[#1a1a2e]/5 text-[#1a1a2e]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                <CheckCircle className={`h-4 w-4 ${useVendor ? 'text-green-600' : 'text-gray-300'}`} />
                Use vendor submission
              </button>
              <button
                type="button"
                onClick={() => setUseVendor(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${!useVendor ? 'border-[#1a1a2e] bg-[#1a1a2e]/5 text-[#1a1a2e]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                <Upload className={`h-4 w-4 ${!useVendor ? 'text-[#1a1a2e]' : 'text-gray-300'}`} />
                Upload new file
              </button>
            </div>
            {useVendor && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                The file the vendor uploaded will be sent directly to the client.
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!useVendor && (
            <div className="space-y-2">
              <Label>Translated Document</Label>
              <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}>
                <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                  <Upload className="h-6 w-6" />
                  {file ? (
                    <span className="text-green-700 font-medium">{file.name}</span>
                  ) : (
                    <span>Click to upload (.docx, .pdf)</span>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".docx,.pdf,.doc"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#1a1a2e] hover:bg-[#2a2a4e]"
            disabled={(!useVendor && !file) || submitting}
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Sending to Client…</>
            ) : (
              'Send to Client'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
