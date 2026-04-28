import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { signToken } from '@/lib/tokens'
import { getResend, FROM_EMAIL } from '@/lib/email/client'
import { QuoteReadyEmail } from '@/lib/email/templates/quote-ready'
import { render as renderAsync } from '@react-email/components'
import { addDays, format } from 'date-fns'

interface Props {
  params: Promise<{ jobId: string }>
}

// PATCH — adjust quote amount
export async function PATCH(req: NextRequest, { params }: Props) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { adjustedAmount, note } = z.object({
    adjustedAmount: z.number().positive(),
    note: z.string().optional(),
  }).parse(body)

  const service = createServiceClient()
  await service.from('jobs').update({ quote_adjusted_amount: adjustedAmount, employee_notes: note ?? null }).eq('id', jobId)
  return NextResponse.json({ ok: true })
}

// POST — send quote to client
export async function POST(_req: NextRequest, { params }: Props) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const service = createServiceClient()
    const { data: job } = await service
      .from('jobs')
      .select('id, job_type, status, source_lang, target_lang, quote_amount, quote_adjusted_amount, clients(contact_name, email)')
      .eq('id', jobId)
      .single()

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const expiryDays = 7
    const expiresAt = addDays(new Date(), expiryDays)
    const token = await signToken({ jobId, type: 'quote' }, `${expiryDays}d`)
    const amount = Number(job.quote_adjusted_amount ?? job.quote_amount)
    const client = job.clients as any

    await service.from('jobs').update({
      status: 'quote_sent',
      quote_token: token,
      quote_token_expires_at: expiresAt.toISOString(),
      quote_finalized_at: new Date().toISOString(),
    }).eq('id', jobId)

    await service.from('job_status_history').insert({
      job_id: jobId,
      old_status: job.status,
      new_status: 'quote_sent',
      changed_by: user.id,
    })

    const html = await renderAsync(QuoteReadyEmail({
      clientName: client.contact_name,
      jobType: job.job_type,
      sourceLang: job.source_lang ?? undefined,
      targetLang: job.target_lang ?? undefined,
      quoteAmount: amount,
      quoteToken: token,
      expiresAt: format(expiresAt, 'MMMM d, yyyy'),
    }))

    const subject = `Your Quote from LA Translation — $${amount.toFixed(2)}`
    const { data: emailData, error: emailError } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: client.email,
      subject,
      html,
    })

    if (emailError) {
      console.error('[quote/send] Resend error:', emailError)
    }

    await service.from('email_log').insert({
      job_id: jobId,
      email_type: 'quote_sent',
      recipient: client.email,
      subject,
      resend_id: emailData?.id ?? null,
      status: emailError ? 'failed' : 'sent',
      error_message: emailError ? String(emailError) : null,
    })

    if (emailError) {
      return NextResponse.json({ error: 'Quote saved but email failed to send. Check Vercel logs.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, token })
  } catch (err) {
    console.error('[quote/send] Unexpected error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
