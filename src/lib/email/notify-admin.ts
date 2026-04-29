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
}

export async function notifyAdminNewInquiry(props: Omit<NewInquiryEmailProps, 'adminUrl'>) {
  if (!ADMIN_EMAIL) return

  const html = await render(NewInquiryEmail({ ...props, adminUrl: ADMIN_URL }))
  const typeLabel = JOB_TYPE_LABELS[props.jobType] ?? props.jobType

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New ${typeLabel} Inquiry — ${props.clientName}`,
    html,
  })
}
