import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: translators } = await supabase
    .from('translators')
    .select('id, full_name, email, phone, vendor_type, language_pairs, specialties, certifications, per_word_rate, hourly_rate, is_active, lat, lng, city, state')
    .eq('is_active', true)
    .order('full_name')

  return NextResponse.json({ translators: translators ?? [] })
}
