'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Printer, Mail, Smartphone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

const METHOD_ICONS: Record<string, React.ReactNode> = {
  paypal: <Mail className="h-3.5 w-3.5" />,
  zelle:  <Smartphone className="h-3.5 w-3.5" />,
  venmo:  <Smartphone className="h-3.5 w-3.5" />,
  check:  <Printer className="h-3.5 w-3.5" />,
  other:  null,
}

const METHOD_LABELS: Record<string, string> = {
  paypal: 'PayPal',
  zelle:  'Zelle',
  venmo:  'Venmo',
  check:  'Check',
  other:  'Manual',
}

interface Props {
  invoiceId: string
  paymentMethod: string
  paymentDetails?: string | null
  amount: number
  translatorName: string
}

export default function MarkPaidButton({ invoiceId, paymentMethod, paymentDetails, amount, translatorName }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const label = METHOD_LABELS[paymentMethod] ?? paymentMethod
  const icon = METHOD_ICONS[paymentMethod] ?? null

  async function handleMarkPaid() {
    setLoading(true)
    const res = await fetch(`/api/admin/invoices/${invoiceId}/mark-paid`, { method: 'POST' })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error ?? 'Failed to mark as paid.')
      setLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="text-right space-y-2">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-left max-w-xs ml-auto">
          <p className="font-medium text-gray-800 mb-1">Send {formatCurrency(amount)} via {label}</p>
          {paymentDetails && (
            <p className="text-gray-600 font-mono break-all">{paymentDetails}</p>
          )}
          <p className="text-gray-400 mt-1">To: {translatorName}</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShowConfirm(false)} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleMarkPaid} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm Paid'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button size="sm" variant="outline" onClick={() => setShowConfirm(true)} className="gap-1.5">
      {icon}
      Pay via {label}
    </Button>
  )
}
