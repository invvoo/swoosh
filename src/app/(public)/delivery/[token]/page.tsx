'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Download, AlertCircle, Loader2, FileCheck } from 'lucide-react'

export default function DeliveryPage() {
  const { token } = useParams<{ token: string }>()
  const [fileInfo, setFileInfo] = useState<{ url: string; filename: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/delivery/${token}`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) { setError(data.error); return }
        setFileInfo(data)
      })
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1a1a2e]">L.A. Translation &amp; Interpretation</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          {error ? (
            <>
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Link Unavailable</h2>
              <p className="text-gray-500 text-sm mb-6">{error}</p>
            </>
          ) : (
            <>
              <FileCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your Translation is Ready</h2>
              <p className="text-gray-500 text-sm mb-6">
                Click the button below to download your completed translation.
                This link is valid for 30 days from delivery.
              </p>
              <a href={fileInfo?.url} download={fileInfo?.filename}>
                <Button size="lg" className="w-full">
                  <Download className="h-4 w-4" />
                  Download {fileInfo?.filename}
                </Button>
              </a>
              <p className="text-xs text-gray-400 mt-4">
                Your translation has been certified and is kept on file for 3 years.
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Questions?{' '}
          <a href="tel:2133857781" className="text-blue-500">(213) 385-7781</a>
          {' '}·{' '}
          <a href="mailto:info@latranslation.com" className="text-blue-500">info@latranslation.com</a>
        </p>
      </div>
    </div>
  )
}
