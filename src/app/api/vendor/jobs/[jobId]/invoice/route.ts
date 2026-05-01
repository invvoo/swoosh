import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface Props { params: Promise<{ jobId: string }> }

export async function POST(req: NextRequest, { params }: Props) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = z.object({
    amount: z.number().positive(),
    note: z.string().max(500).optional(),
  }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const service = createServiceClient()

  const { data: translator } = await service
    .from('translators')
    .select('id')
    .eq('email', user.email)
    .eq('is_active', true)
    .maybeSingle()
  if (!translator) return NextResponse.json({ error: 'No active vendor account' }, { status: 403 })

  const { data: job } = await service
    .from('jobs')
    .select('id, status')
    .eq('id', jobId)
    .eq('assigned_translator_id', translator.id)
    .single()
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  // Check no invoice already submitted
  const { data: existing } = await service
    .from('translator_invoices')
    .select('id')
    .eq('job_id', jobId)
    .maybeSingle()
  if (existing) return NextResponse.json({ error: 'An invoice has already been submitted for this job' }, { status: 409 })

  const { error } = await service.from('translator_invoices').insert({
    job_id: jobId,
    translator_id: translator.id,
    amount: parsed.data.amount,
    status: 'submitted',
    notes: parsed.data.note ?? null,
  } as any)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
