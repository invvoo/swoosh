import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-5" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Confirmed</h1>
        <p className="text-gray-500 mb-2">
          Thank you for choosing L.A. Translation &amp; Interpretation.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Your payment has been received and we will begin processing your order immediately.
          A confirmation email will be sent to you shortly with your invoice details.
        </p>
        <p className="text-sm text-gray-500">
          Questions? Call{' '}
          <a href="tel:2133857781" className="text-blue-600 font-medium">(213) 385-7781</a>
          {' '}or email{' '}
          <a href="mailto:info@latranslation.com" className="text-blue-600 font-medium">info@latranslation.com</a>
        </p>
      </div>
    </div>
  )
}
