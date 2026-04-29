import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: jobs } = await service
    .from('jobs')
    .select('id, job_type, status, source_lang, target_lang, word_count, quote_amount, quote_adjusted_amount, quote_rush_days, invoice_number, created_at, scheduled_at, delivered_at')
    .eq('clients.email', user.email)
    .order('created_at', { ascending: false })

  // jobs are joined via client_id → clients.email — use a proper join
  const { data: client } = await service
    .from('clients')
    .select('id')
    .eq('email', user.email)
    .maybeSingle()

  if (!client) return NextResponse.json({ jobs: [] })

  const { data: clientJobs } = await service
    .from('jobs')
    .select('id, job_type, status, source_lang, target_lang, word_count, quote_amount, quote_adjusted_amount, quote_rush_days, invoice_number, created_at, scheduled_at, delivered_at, estimated_turnaround_days, requested_delivery_date')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ jobs: clientJobs ?? [], clientId: client.id })
}
