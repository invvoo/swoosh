'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function ApproveInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    await fetch(`/api/admin/invoices/${invoiceId}/approve`, { method: 'POST' })
    setLoading(false)
    startTransition(() => router.refresh())
  }

  return (
    <Button size="sm" onClick={handleApprove} disabled={loading} className="h-7 text-xs bg-[#1a1a2e] hover:bg-[#2a2a4e]">
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Approve'}
    </Button>
  )
}
