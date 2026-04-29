import { render } from '@react-email/components'
import { getResend, FROM_EMAIL } from './client'
import { NewInquiryEmail, type NewInquiryEmailProps } from './templates/new-inquiry'

const ADMIN_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? ''

const JOB_TYPE_LABELS: Record<string, string> = {
  translation: 'Translation',
  interpretation: 'Interpretation',
  equipment_rental: 'Equipment Rental',
  notary: 'Notary / Apostille',
  transcription: 'Transcription / Subtitling',
}

export async function notifyAdminNewInquiry(props: Omit<NewInquiryEmailProps, 'adminUrl'>) {
  if (!ADMIN_EMAIL) {
    console.warn('[notify-admin] ADMIN_NOTIFY_EMAIL is not set — skipping admin notification')
    return
  }
  if (!process.env.RESEND_API_KEY) {
    console.warn('[notify-admin] RESEND_API_KEY is not set — skipping admin notification')
    return
  }

  const html = await render(NewInquiryEmail({ ...props, adminUrl: ADMIN_URL }))
  const typeLabel = JOB_TYPE_LABELS[props.jobType] ?? props.jobType

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New ${typeLabel} Inquiry — ${props.clientName}`,
    html,
  })

  if (error) {
    console.error('[notify-admin] Resend error:', JSON.stringify(error))
    throw error
  }
  console.log('[notify-admin] Sent to', ADMIN_EMAIL, 'id:', data?.id)
}
