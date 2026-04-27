import { XCircle } from 'lucide-react'

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
        <XCircle className="h-14 w-14 text-red-400 mx-auto mb-5" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Cancelled</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your payment was not completed. Your quote is still valid — simply click the original
          quote link in your email to try again.
        </p>
        <p className="text-sm text-gray-500">
          Need help? Call{' '}
          <a href="tel:2133857781" className="text-blue-600 font-medium">(213) 385-7781</a>
          {' '}or email{' '}
          <a href="mailto:info@latranslation.com" className="text-blue-600">info@latranslation.com</a>
        </p>
      </div>
    </div>
  )
}
