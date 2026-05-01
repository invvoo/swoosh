import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { notifyAdminNewInquiry } from '@/lib/email/notify-admin'

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  vendorType: z.enum(['translator', 'interpreter', 'both', 'notary', 'other']),
  languagePairs: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  perWordRate: z.number().positive().optional(),
  hourlyRate: z.number().positive().optional(),
  notes: z.string().max(1000).optional(),
  paymentMethod: z.enum(['stripe', 'paypal', 'zelle', 'venmo', 'check', 'other']).default('check'),
  paymentDetails: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { fullName, email, phone, vendorType, languagePairs, specialties, perWordRate, hourlyRate, notes, paymentMethod, paymentDetails } = parsed.data

  const service = createServiceClient()

  // Check for existing record
  const { data: existing } = await service
    .from('translators')
    .select('id, is_active')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    if (existing.is_active) {
      return NextResponse.json({ error: 'An active vendor account already exists for this email. Please sign in.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'An application for this email is already pending review.' }, { status: 409 })
  }

  // Parse language pairs from comma-separated string into array
  const langPairsArray = languagePairs
    ? languagePairs.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const { error } = await service
    .from('translators')
    .insert({
      full_name: fullName,
      email,
      phone: phone ?? null,
      vendor_type: vendorType,
      language_pairs: langPairsArray,
      specialties: specialties ?? [],
      per_word_rate: perWordRate ?? null,
      hourly_rate: hourlyRate ?? null,
      notes: notes ?? null,
      is_active: false,
      applied_at: new Date().toISOString(),
      payment_method: paymentMethod,
      payment_details: paymentDetails ?? null,
    } as any)

  if (error) {
    console.error('[vendor-signup] Insert error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }

  // Notify admin
  const VENDOR_TYPE_LABELS: Record<string, string> = {
    translator: 'Translator',
    interpreter: 'Interpreter',
    both: 'Translator & Interpreter',
    notary: 'Notary / Apostille Agent',
    other: 'Other',
  }
  notifyAdminNewVendorApplication({
    fullName,
    email,
    phone,
    vendorType: VENDOR_TYPE_LABELS[vendorType] ?? vendorType,
    languagePairs: langPairsArray,
    specialties: specialties ?? [],
    perWordRate,
    hourlyRate,
    notes,
    paymentMethod,
    paymentDetails,
  }).catch((err) => console.error('[vendor-signup] Admin notify error:', err))

  return NextResponse.json({ success: true })
}

async function notifyAdminNewVendorApplication(params: {
  fullName: string
  email: string
  phone?: string
  vendorType: string
  languagePairs: string[]
  specialties: string[]
  perWordRate?: number
  hourlyRate?: number
  notes?: string
  paymentMethod?: string
  paymentDetails?: string
}) {
  const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? ''
  if (!ADMIN_EMAIL || !process.env.RESEND_API_KEY) return

  const { getResend, FROM_EMAIL } = await import('@/lib/email/client')

  const body = [
    `Name: ${params.fullName}`,
    `Email: ${params.email}`,
    params.phone ? `Phone: ${params.phone}` : null,
    `Type: ${params.vendorType}`,
    params.languagePairs.length > 0 ? `Languages: ${params.languagePairs.join(', ')}` : null,
    params.specialties.length > 0 ? `Specialties: ${params.specialties.join(', ')}` : null,
    params.perWordRate != null ? `Per-word rate: $${params.perWordRate.toFixed(4)}` : null,
    params.hourlyRate != null ? `Hourly rate: $${params.hourlyRate.toFixed(2)}/hr` : null,
    params.notes ? `\nMessage:\n${params.notes}` : null,
    params.paymentMethod ? `\nPayment method: ${params.paymentMethod}` : null,
    params.paymentDetails ? `Payment details: ${params.paymentDetails}` : null,
  ].filter(Boolean).join('\n')

  const adminUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const link = adminUrl ? `${adminUrl}/admin/translators` : ''

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Vendor Application — ${params.fullName} (${params.vendorType})`,
    html: `<pre style="font-family:sans-serif;font-size:14px;">${body}</pre>${link ? `<p><a href="${link}">Review in Admin →</a></p>` : ''}`,
  })
}
