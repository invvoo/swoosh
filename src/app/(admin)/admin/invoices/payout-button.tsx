'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PayoutButton({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handlePayout() {
    if (!confirm('Initiate Stripe transfer for this invoice?')) return
    setLoading(true)
    const res = await fetch(`/api/admin/invoices/${invoiceId}/payout`, { method: 'POST' })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error ?? 'Payout failed.')
      setLoading(false)
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handlePayout} disabled={loading}>
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Pay Now'}
    </Button>
  )
}
