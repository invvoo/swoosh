import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenWithReason } from '@/lib/tokens'
import { createServiceClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ token: string }>
}

export async function GET(_req: NextRequest, { params }: Props) {
  const { token } = await params
  const result = await verifyTokenWithReason(token)

  if (!result.ok) {
    // On expiry, try to surface client info so the UI can offer a re-request form
    if (result.reason === 'expired' && result.expiredPayload?.jobId) {
      const supabase = createServiceClient()
      const { data: job } = await supabase
        .from('jobs')
        .select('id, job_type, source_lang, target_lang, clients(contact_name, email)')
        .eq('id', result.expiredPayload.jobId)
        .maybeSingle() as unknown as { data: Record<string, any> | null }
      if (job) {
        return NextResponse.json({
          error: 'expired',
          jobId: job.id,
          jobType: job.job_type,
          sourceLang: job.source_lang,
          targetLang: job.target_lang,
          clientName: (job.clients as any)?.contact_name ?? null,
          clientEmail: (job.clients as any)?.email ?? null,
        }, { status: 410 })
      }
    }
    return NextResponse.json({ error: result.reason }, { status: 410 })
  }

  if (result.payload.type !== 'quote') {
    return NextResponse.json({ error: 'invalid' }, { status: 410 })
  }

  const supabase = createServiceClient()
  const { data: job } = await supabase
    .from('jobs')
    .select('id, job_type, status, source_lang, target_lang, word_count, quote_amount, quote_adjusted_amount, quote_rush_days, quote_rush_fee_percent, quote_token_expires_at, quote_accepted_at, invoice_number, clients(contact_name)')
    .eq('id', result.payload.jobId)
    .maybeSingle() as unknown as { data: Record<string, any> | null }

  if (!job) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (job.status === 'cancelled') return NextResponse.json({ error: 'cancelled' }, { status: 410 })

  return NextResponse.json({
    jobId: job.id,
    jobType: job.job_type,
    status: job.status,
    sourceLang: job.source_lang,
    targetLang: job.target_lang,
    wordCount: job.word_count,
    amount: Number(job.quote_adjusted_amount ?? job.quote_amount),
    rushDays: job.quote_rush_days ?? 0,
    rushFeePercent: job.quote_rush_fee_percent ?? 0,
    expiresAt: job.quote_token_expires_at,
    acceptedAt: job.quote_accepted_at,
    clientName: (job.clients as any)?.contact_name,
  })
}
