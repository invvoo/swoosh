import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { extractWordCount } from '@/lib/pdf/word-counter'
import { calculateQuote, calcTurnaroundDays, calculateRushFee } from '@/lib/quote/calculator'
import { resolveTranslationRate, resolveCertMinimum } from '@/lib/quote/pricing'
import { getResend, FROM_EMAIL } from '@/lib/email/client'
import { AutoQuoteEstimateEmail } from '@/lib/email/templates/auto-quote-estimate'
import { render } from '@react-email/components'
import { notifyAdminNewInquiry } from '@/lib/email/notify-admin'

const CERT_SPECIALTY: Record<string, string> = {
  none: 'General',
  general: 'Certified (USCIS)',
  court: 'Court Certified',
}

const CERT_LABEL: Record<string, string> = {
  none: 'No certification',
  general: 'General / Company',
  court: 'Court Certified',
}

const schema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  clientCompany: z.string().optional(),
  sourceLang: z.string().min(1).optional(),
  targetLang: z.string().min(1),
  // New: certification type (public form)
  certificationTpe: z.enum(['none', 'general', 'court']).optional(),
  // Legacy: specialty UUID (admin manual-entry form, backward compat)
  specialtyId: z.string().uuid().optional(),
  // Language detection metadata from client
  detectedSourceLang: z.string().optional(),
  detectedSourceLangConfidence: z.coerce.number().min(0).max(1).optional(),
  requestedDeliveryDays: z.coerce.number().int().min(1).max(30).optional(),
}).refine(
  (d) => d.sourceLang || d.detectedSourceLang,
  { message: 'sourceLang or detectedSourceLang is required' },
)

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('document') as File | null
  if (!file) return NextResponse.json({ error: 'Document is required' }, { status: 400 })

  const parsed = schema.safeParse({
    clientName: formData.get('clientName'),
    clientEmail: formData.get('clientEmail'),
    clientPhone: formData.get('clientPhone') || undefined,
    clientCompany: formData.get('clientCompany') || undefined,
    sourceLang: formData.get('sourceLang') || undefined,
    targetLang: formData.get('targetLang'),
    certificationTpe: formData.get('certificationTpe') || undefined,
    specialtyId: formData.get('specialtyId') || undefined,
    detectedSourceLang: formData.get('detectedSourceLang') || undefined,
    detectedSourceLangConfidence: formData.get('detectedSourceLangConfidence') || undefined,
    requestedDeliveryDays: formData.get('requestedDeliveryDays') || undefined,
  })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const {
    clientName, clientEmail, clientPhone, clientCompany,
    targetLang, certificationTpe, specialtyId,
    detectedSourceLang, detectedSourceLangConfidence,
    requestedDeliveryDays,
  } = parsed.data

  const effectiveSourceLang = parsed.data.sourceLang || detectedSourceLang!
  const supabase = createServiceClient()
  const buffer = Buffer.from(await file.arrayBuffer())

  // Word count extraction can time out on large PDFs — proceed without it if so
  const wordCountOrNull = await Promise.race<number | null>([
    extractWordCount(buffer, file.name).catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 25000)),
  ])
  const wordCount = wordCountOrNull ?? 0

  const [specialtyRow, settingsResult] = await Promise.all([
    resolveSpecialty(supabase, certificationTpe, specialtyId),
    supabase.from('system_settings').select('key, value').in('key', [
      'translation_minimum_standard',
      'translation_minimum_certified',
      'translation_minimum_court',
      'translation_minimum_court_premium',
      'translation_court_premium_langs',
    ]),
  ])

  const settingsMap = Object.fromEntries(
    (settingsResult.data ?? []).map((s) => [s.key, Number(s.value)])
  )

  const pricing = await resolveTranslationRate(effectiveSourceLang, targetLang, supabase)

  const certForMinimum = certificationTpe
    ?? (specialtyRow.name === 'Certified (USCIS)' ? 'general'
      : specialtyRow.name === 'Court Certified' ? 'court'
        : 'none')
  const minimum = resolveCertMinimum(certForMinimum, effectiveSourceLang, targetLang, settingsMap)

  // No auto-quote if word count couldn't be extracted or pricing is missing
  const certKey = (certForMinimum as 'court' | 'general' | 'none')
  const standardDays = wordCount > 0 ? calcTurnaroundDays(wordCount, certKey) : null

  let rushDays = 0
  let rushFeePercent = 0
  let rushAmount = 0
  if (requestedDeliveryDays !== undefined && standardDays !== null && requestedDeliveryDays < standardDays) {
    const rush = calculateRushFee(0, standardDays - requestedDeliveryDays)
    rushDays = rush.rushDays
    rushFeePercent = rush.rushFeePercent
  }

  let quoteAmount: number | null = null
  if (wordCount > 0 && pricing.perWordRate !== null && specialtyRow.multiplier !== null) {
    const q = calculateQuote(wordCount, pricing.perWordRate, specialtyRow.multiplier, specialtyRow.name ?? '', minimum)
    if (rushDays > 0) {
      const rush = calculateRushFee(q.finalAmount, rushDays)
      rushAmount = rush.rushAmount
      quoteAmount = rush.totalAmount
    } else {
      quoteAmount = q.finalAmount
    }
  }

  // Upload document
  const jobId = crypto.randomUUID()
  const storagePath = `documents/raw/${jobId}/${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('job-documents')
    .upload(storagePath, buffer, { contentType: file.type, upsert: false })
  if (uploadError) {
    console.error('[translation] Storage upload error:', uploadError)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }

  // Upsert client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .upsert(
      { contact_name: clientName, email: clientEmail, phone: clientPhone ?? null, company_name: clientCompany ?? null },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select('id')
    .single()
  if (clientError || !client) return NextResponse.json({ error: 'Failed to create client record' }, { status: 500 })

  // Create job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      id: jobId,
      job_type: 'translation',
      status: 'draft',
      client_id: client.id,
      source_lang: effectiveSourceLang,
      target_lang: targetLang,
      specialty_id: specialtyRow.id ?? null,
      word_count: wordCount,
      document_path: storagePath,
      document_name: file.name,
      quote_per_word_rate: pricing.perWordRate ?? null,
      quote_multiplier: specialtyRow.multiplier ?? null,
      quote_amount: quoteAmount,
      quote_rush_days: rushDays,
      quote_rush_fee_percent: rushFeePercent,
      quote_rush_amount: rushAmount || null,
      estimated_turnaround_days: standardDays,
      requested_delivery_date: requestedDeliveryDays && standardDays
        ? new Date(Date.now() + requestedDeliveryDays * 86400000).toISOString().slice(0, 10)
        : null,
      detected_source_lang: detectedSourceLang ?? null,
      detected_source_lang_confidence: detectedSourceLangConfidence ?? null,
      certification_type: certificationTpe ?? null,
      missing_pricing_warning: pricing.warning ?? null,
      quote_is_pivot: pricing.isPivot,
    } as any)
    .select('id')
    .single()
  if (jobError || !job) {
    console.error('[translation] Job insert error:', jobError)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }

  await supabase.from('job_status_history').insert({ job_id: job.id, new_status: 'draft' })

  // Fire-and-forget emails (client auto-quote + admin notification)
  sendAutoQuoteEmail({
    clientName, clientEmail, sourceLang: effectiveSourceLang, targetLang,
    certificationTpe: certificationTpe ?? 'none',
    wordCount, estimatedAmount: quoteAmount ?? 0,
    hasMissingPricing: pricing.warning !== null,
  }).catch((err) => console.error('[translation] Auto-quote email error:', err))

  notifyAdminNewInquiry({
    jobType: 'translation',
    jobId: job.id,
    clientName,
    clientEmail,
    sourceLang: effectiveSourceLang,
    targetLang,
    wordCount,
    certificationLabel: CERT_LABEL[certificationTpe ?? 'none'],
    estimatedAmount: quoteAmount ?? 0,
    missingPricing: pricing.warning,
  }).catch((err) => console.error('[translation] Admin notify error:', err))

  return NextResponse.json({
    jobId: job.id,
    wordCount,
    estimatedQuote: quoteAmount,
    missingPricing: pricing.warning,
    isPivot: pricing.isPivot,
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function resolveSpecialty(
  supabase: ReturnType<typeof createServiceClient>,
  certificationTpe: string | undefined,
  specialtyId: string | undefined,
): Promise<{ id: string | null; name: string | null; multiplier: number | null }> {
  if (certificationTpe) {
    const { data } = await supabase
      .from('specialty_multipliers')
      .select('id, name, multiplier')
      .eq('name', CERT_SPECIALTY[certificationTpe])
      .eq('is_active', true)
      .maybeSingle()
    return { id: data?.id ?? null, name: data?.name ?? null, multiplier: data ? Number(data.multiplier) : null }
  }
  if (specialtyId) {
    const { data } = await supabase
      .from('specialty_multipliers')
      .select('id, name, multiplier')
      .eq('id', specialtyId)
      .single()
    return { id: data?.id ?? null, name: data?.name ?? null, multiplier: data ? Number(data.multiplier) : null }
  }
  return { id: null, name: null, multiplier: 1.0 }
}

async function sendAutoQuoteEmail(params: {
  clientName: string; clientEmail: string; sourceLang: string; targetLang: string
  certificationTpe: string; wordCount: number; estimatedAmount: number; hasMissingPricing: boolean
}) {
  const html = await render(AutoQuoteEstimateEmail({
    clientName: params.clientName,
    jobType: 'translation',
    sourceLang: params.sourceLang,
    targetLang: params.targetLang,
    certificationLabel: CERT_LABEL[params.certificationTpe] ?? 'Standard',
    wordCount: params.wordCount,
    estimatedAmount: params.estimatedAmount,
    hasMissingPricing: params.hasMissingPricing,
  }))

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: params.clientEmail,
    subject: params.hasMissingPricing
      ? 'We Received Your Translation Request — LA Translation'
      : `Translation Estimate: $${params.estimatedAmount.toFixed(2)} — LA Translation`,
    html,
  })
  if (error) console.error('[translation] Resend error:', error)
}
