import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { translateDocument } from '@/lib/ai/translate'
import { extractText } from '@/lib/pdf/word-counter'

// Allow up to 5 minutes — Claude can take a while on large documents
export const maxDuration = 300

interface Props {
  params: Promise<{ jobId: string }>
}

export async function POST(_req: NextRequest, { params }: Props) {
  const { jobId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  const { data: job, error: jobErr } = await service
    .from('jobs')
    .select('id, job_type, status, source_lang, target_lang, document_path, document_name, specialty_id')
    .eq('id', jobId)
    .single() as any

  if (jobErr || !job) {
    console.error('[ai-translate] Job fetch error:', jobErr)
    return NextResponse.json({ error: 'Job not found', detail: jobErr?.message ?? null }, { status: 404 })
  }

  let specialtyName = 'General'
  if (job.specialty_id) {
    const { data: sp } = await service.from('specialty_multipliers').select('name').eq('id', job.specialty_id).maybeSingle() as any
    if (sp?.name) specialtyName = sp.name
  }
  if (job.job_type !== 'translation' && !job.document_path) {
    return NextResponse.json({ error: 'Not a translation job or no document' }, { status: 400 })
  }
  if (!job.source_lang || !job.target_lang) {
    return NextResponse.json({ error: 'Job is missing source or target language' }, { status: 400 })
  }

  await service.from('jobs').update({
    status: 'ai_translating',
    ai_translation_started_at: new Date().toISOString(),
  } as any).eq('id', jobId)

  await service.from('job_status_history').insert({
    job_id: jobId,
    old_status: job.status,
    new_status: 'ai_translating',
    changed_by: user.id,
    note: 'AI translation triggered manually',
  })

  const { data: rulesSetting } = await service
    .from('system_settings')
    .select('value')
    .eq('key', 'ai_translation_rules')
    .maybeSingle()
  const customSystemPrompt = (rulesSetting as any)?.value?.trim() || undefined

  try {
    const { data: fileData, error: dlError } = await service.storage
      .from('job-documents')
      .download(job.document_path)

    if (dlError || !fileData) throw new Error(`Storage download failed: ${dlError?.message}`)

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const docName = job.document_name ?? 'document.docx'

    const text = await extractText(buffer, docName)
    if (!text.trim()) throw new Error('No text could be extracted from the document')

    const translated = await translateDocument(text, job.source_lang, job.target_lang, specialtyName, customSystemPrompt)

    const draftPath = `documents/ai-draft/${jobId}/ai_draft.txt`
    const { error: uploadError } = await service.storage
      .from('job-documents')
      .upload(draftPath, Buffer.from(translated, 'utf-8'), {
        contentType: 'text/plain',
        upsert: true,
      })
    if (uploadError) throw new Error(`Draft upload failed: ${uploadError.message}`)

    await service.from('jobs').update({
      status: 'ai_review_pending',
      ai_draft_path: draftPath,
      ai_translation_completed_at: new Date().toISOString(),
    } as any).eq('id', jobId)

    await service.from('job_status_history').insert({
      job_id: jobId,
      old_status: 'ai_translating',
      new_status: 'ai_review_pending',
      changed_by: user.id,
      note: 'AI draft generated',
    })

    return NextResponse.json({ ok: true, status: 'ai_review_pending' })
  } catch (err) {
    console.error('[ai-translate] Translation failed:', err)
    await service.from('jobs').update({ status: 'ai_failed' } as any).eq('id', jobId)
    await service.from('job_status_history').insert({
      job_id: jobId,
      old_status: 'ai_translating',
      new_status: 'ai_failed',
      changed_by: user.id,
      note: `AI translation error: ${String(err).slice(0, 200)}`,
    })
    return NextResponse.json({ error: 'AI translation failed', detail: String(err).slice(0, 200) }, { status: 500 })
  }
}
