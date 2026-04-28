import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { extractWordCount } from '@/lib/pdf/word-counter'
import { calculateQuote, CERTIFIED_SPECIALTY_NAME } from '@/lib/quote/calculator'

const schema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  clientCompany: z.string().optional(),
  sourceLang: z.string().min(1),
  targetLang: z.string().min(1),
  specialtyId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('document') as File | null

  if (!file) return NextResponse.json({ error: 'Document is required' }, { status: 400 })

  const parsed = schema.safeParse({
    clientName: formData.get('clientName'),
    clientEmail: formData.get('clientEmail'),
    clientPhone: formData.get('clientPhone') || undefined,
    clientCompany: formData.get('clientCompany') || undefined,
    sourceLang: formData.get('sourceLang'),
    targetLang: formData.get('targetLang'),
    specialtyId: formData.get('specialtyId'),
  })

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { clientName, clientEmail, clientPhone, clientCompany, sourceLang, targetLang, specialtyId } = parsed.data
  const supabase = createServiceClient()

  // Fetch language pair, specialty, and minimums in parallel
  const [{ data: langPair }, { data: specialty }, { data: settings }] = await Promise.all([
    supabase
      .from('language_pairs')
      .select('id, per_word_rate')
      .eq('source_lang', sourceLang)
      .eq('target_lang', targetLang)
      .eq('is_active', true)
      .maybeSingle(),
    supabase
      .from('specialty_multipliers')
      .select('id, name, multiplier')
      .eq('id', specialtyId)
      .single(),
    supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['translation_minimum_standard', 'translation_minimum_certified']),
  ])

  if (!langPair) return NextResponse.json({ error: 'Language pair not found or not supported' }, { status: 400 })
  if (!specialty) return NextResponse.json({ error: 'Specialty not found' }, { status: 400 })

  const settingsMap = Object.fromEntries((settings ?? []).map((s) => [s.key, Number(s.value)]))
  const isCertified = specialty.name === CERTIFIED_SPECIALTY_NAME
  const minimum = isCertified
    ? (settingsMap['translation_minimum_certified'] ?? 250)
    : (settingsMap['translation_minimum_standard'] ?? 95)

  // Extract word count
  const buffer = Buffer.from(await file.arrayBuffer())
  const wordCount = await extractWordCount(buffer, file.name)

  // Calculate quote with minimum
  const quote = calculateQuote(wordCount, Number(langPair.per_word_rate), Number(specialty.multiplier), specialty.name, minimum)

  // Upload document to Supabase Storage
  const jobId = crypto.randomUUID()
  const storagePath = `documents/raw/${jobId}/${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('job-documents')
    .upload(storagePath, buffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
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

  if (clientError || !client) {
    return NextResponse.json({ error: 'Failed to create client record' }, { status: 500 })
  }

  // Create job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      id: jobId,
      job_type: 'translation',
      status: 'draft',
      client_id: client.id,
      source_lang: sourceLang,
      target_lang: targetLang,
      specialty_id: specialtyId,
      word_count: wordCount,
      document_path: storagePath,
      document_name: file.name,
      quote_per_word_rate: Number(langPair.per_word_rate),
      quote_multiplier: Number(specialty.multiplier),
      quote_amount: quote.finalAmount,
    })
    .select('id')
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }

  await supabase.from('job_status_history').insert({ job_id: job.id, new_status: 'draft' })

  return NextResponse.json({ jobId: job.id, wordCount, estimatedQuote: quote.finalAmount, minimumApplied: quote.minimumApplied })
}
