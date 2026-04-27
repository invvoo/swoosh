import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/tokens'
import { createServiceClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ token: string }>
}

export async function GET(_req: NextRequest, { params }: Props) {
  const { token } = await params
  const payload = await verifyToken(token)

  if (!payload || payload.type !== 'quote') {
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  const supabase = createServiceClient()
  const { data: job } = await supabase
    .from('jobs')
    .select('id, job_type, status, source_lang, target_lang, word_count, quote_amount, quote_adjusted_amount, quote_token_expires_at, quote_accepted_at, invoice_number, clients(contact_name)')
    .eq('id', payload.jobId)
    .maybeSingle()

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
    expiresAt: job.quote_token_expires_at,
    acceptedAt: job.quote_accepted_at,
    clientName: (job.clients as any)?.contact_name,
  })
}
