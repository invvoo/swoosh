import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { autoClaimJob } from '@/lib/admin/auto-claim'

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

  const service = createServiceClient()
  const { data: job } = await service.from('jobs').select('status, clients(email, contact_name), source_lang, target_lang, ai_draft_path').eq('id', jobId).single()
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: translator } = await service.from('translators').select('full_name, email').eq('id', translatorId).single()
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

  return NextResponse.json({ ok: true })
}
