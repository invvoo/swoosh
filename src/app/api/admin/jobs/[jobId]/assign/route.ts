import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { autoClaimJob } from '@/lib/admin/auto-claim'
import { getResend, FROM_EMAIL } from '@/lib/email/client'
import { TranslatorAssignedEmail } from '@/lib/email/templates/translator-assigned'
import { render as renderAsync } from '@react-email/components'

interface Props {
  params: Promise<{ jobId: string }>
}

export async function POST(req: NextRequest, { params }: Props) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { translatorId, deadlineAt } = z.object({
    translatorId: z.string().uuid(),
    deadlineAt: z.string().datetime({ offset: true }).optional(),
  }).parse(body)

  const origin = req.headers.get('origin') ?? req.headers.get('x-forwarded-proto')?.split(',')[0].trim() + '://' + req.headers.get('host')
  const baseUrl = origin ?? process.env.NEXT_PUBLIC_APP_URL ?? ''

  const service = createServiceClient()
  const { data: job } = await service
    .from('jobs')
    .select('status, invoice_number, word_count, source_lang, target_lang, document_path, ai_draft_path, clients(email, contact_name)')
    .eq('id', jobId)
    .single()
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: translator } = await service
    .from('translators')
    .select('id, full_name, email')
    .eq('id', translatorId)
    .single()
  if (!translator) return NextResponse.json({ error: 'Translator not found' }, { status: 404 })

  await service.from('jobs').update({
    assigned_translator_id: translatorId,
    assigned_at: new Date().toISOString(),
    deadline_at: deadlineAt ?? null,
    status: 'assigned',
  }).eq('id', jobId)

  await service.from('job_status_history').insert({
    job_id: jobId,
    old_status: job.status,
    new_status: 'assigned',
    changed_by: user.id,
    note: `Assigned to ${translator.full_name}`,
  })

  await autoClaimJob(service, jobId, user.id)

  // Send assignment email to translator
  try {
    const html = await renderAsync(TranslatorAssignedEmail({
      translatorName: translator.full_name,
      sourceLang: job.source_lang ?? undefined,
      targetLang: job.target_lang ?? undefined,
      wordCount: job.word_count ?? undefined,
      deadlineAt: deadlineAt,
      invoiceNumber: job.invoice_number ?? undefined,
      jobPortalUrl: `${baseUrl}/vendor/jobs/${jobId}`,
      originalDocUrl: `${baseUrl}/api/admin/jobs/${jobId}/document`,
      aiDraftUrl: job.ai_draft_path ? `${baseUrl}/api/admin/jobs/${jobId}/document?type=draft` : undefined,
    }))

    const langLabel = job.source_lang && job.target_lang
      ? `${job.source_lang} → ${job.target_lang}`
      : 'Translation'

    const { data: emailData, error: emailError } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: translator.email,
      subject: `New Job Assigned — ${langLabel}${job.invoice_number ? ` (${job.invoice_number})` : ''}`,
      html,
    })

    await service.from('email_log').insert({
      job_id: jobId,
      email_type: 'translator_assigned',
      recipient: translator.email,
      subject: `New Job Assigned — ${langLabel}`,
      resend_id: emailData?.id ?? null,
      status: emailError ? 'failed' : 'sent',
      error_message: emailError ? String(emailError) : null,
    } as any)
  } catch (err) {
    console.error('[assign] Email failed (non-fatal):', err)
  }

  return NextResponse.json({ ok: true })
}
