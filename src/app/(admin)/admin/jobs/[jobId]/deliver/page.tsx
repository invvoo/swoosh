'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DeliverPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setSubmitting(true)

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
          Upload the final reviewed translation. This will trigger the delivery email to the client
          with a secure 30-day download link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <Button type="submit" className="w-full" disabled={!file || submitting}>
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Uploading &amp; Sending…</>
            ) : (
              'Upload &amp; Send to Client'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
