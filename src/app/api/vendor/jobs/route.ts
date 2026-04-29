import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  const { data: translator } = await service
    .from('translators')
    .select('id, full_name, language_pairs, specialties, is_active')
    .eq('email', user.email)
    .maybeSingle()

  if (!translator) {
    return NextResponse.json({ error: 'no_account', message: 'No vendor account found for this email.' }, { status: 403 })
  }

  if (!translator.is_active) {
    return NextResponse.json({ error: 'pending_approval', message: 'Your application is pending review.' }, { status: 403 })
  }

  const { data: jobs } = await service
    .from('jobs')
    .select('id, job_type, status, source_lang, target_lang, word_count, invoice_number, deadline_at, assigned_at, created_at, document_name, document_path, ai_draft_path, clients(contact_name)')
    .eq('assigned_translator_id', translator.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ translator, jobs: jobs ?? [] })
}
