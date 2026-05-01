import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL } from '@/lib/email/client'
import { TranslationInquiryEmail } from '@/lib/email/templates/translation-inquiry'
import { render as renderAsync } from '@react-email/components'
import { z } from 'zod'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? 'info@latranslation.com'
const ADMIN_PHONE = '(213) 385-7781'

const schema = z.object({
  translatorIds: z.array(z.string().uuid()).min(1),
})

interface Props { params: Promise<{ jobId: string }> }

export async function POST(req: NextRequest, { params }: Props) {
  const { jobId } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 422 })

  const supabase = createServiceClient()

  const { data: job } = await (supabase as any)
    .from('jobs')
    .select('*, specialty_multipliers:specialty_id(name), clients(contact_name, email)')
    .eq('id', jobId)
    .single()

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const { data: translators } = await supabase
    .from('translators')
    .select('id, full_name, email')
    .in('id', parsed.data.translatorIds)

  if (!translators?.length) return NextResponse.json({ error: 'No translators found' }, { status: 404 })

  const specialty = (job.specialty_multipliers as any)?.name ?? 'General'
  const contacted: { name: string; email: string }[] = []

  for (const translator of translators) {
    try {
      const html = await renderAsync(TranslationInquiryEmail({
        translatorName: translator.full_name,
        sourceLang: job.source_lang ?? '',
        targetLang: job.target_lang ?? '',
        wordCount: job.word_count ?? 0,
        specialty,
        turnaroundDays: job.estimated_turnaround_days ?? undefined,
        quotedRate: job.quote_per_word_rate != null ? Number(job.quote_per_word_rate) : undefined,
        documentName: job.document_name ?? undefined,
        adminEmail: ADMIN_EMAIL,
        adminPhone: ADMIN_PHONE,
        vendorPortalUrl: `${BASE_URL}/vendor/jobs`,
      }))

      const { error } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: translator.email,
        subject: `Translation Job Inquiry — ${job.source_lang} → ${job.target_lang} · ${(job.word_count ?? 0).toLocaleString()} words`,
        html,
      })

      await supabase.from('email_log').insert({
        job_id: jobId,
        email_type: 'translator_inquiry',
        recipient: translator.email,
        subject: `Translation Job Inquiry — ${job.source_lang} → ${job.target_lang}`,
        status: error ? 'failed' : 'sent',
        error_message: error ? String(error) : null,
      } as any)

      if (!error) contacted.push({ name: translator.full_name, email: translator.email })
    } catch (e) {
      console.error(`[translator-inquiry] failed for ${translator.email}:`, e)
    }
  }

  if (contacted.length > 0) {
    await supabase.from('job_status_history').insert({
      job_id: jobId,
      old_status: job.status,
      new_status: job.status,
      note: `Availability inquiry sent to ${contacted.length} translator${contacted.length !== 1 ? 's' : ''}: ${contacted.map((c) => c.name).join(', ')}`,
    } as any)
  }

  return NextResponse.json({ contacted })
}
