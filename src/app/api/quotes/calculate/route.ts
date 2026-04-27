import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateQuote } from '@/lib/quote/calculator'

const schema = z.object({
  wordCount: z.coerce.number().int().min(1),
  languagePairId: z.string().uuid(),
  specialtyId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { wordCount, languagePairId, specialtyId } = parsed.data
  const supabase = createServiceClient()

  const [{ data: langPair }, { data: specialty }] = await Promise.all([
    supabase.from('language_pairs').select('per_word_rate').eq('id', languagePairId).single(),
    supabase.from('specialty_multipliers').select('name, multiplier').eq('id', specialtyId).single(),
  ])

  if (!langPair || !specialty) {
    return NextResponse.json({ error: 'Invalid language pair or specialty' }, { status: 400 })
  }

  const breakdown = calculateQuote(wordCount, Number(langPair.per_word_rate), Number(specialty.multiplier), specialty.name)
  return NextResponse.json(breakdown)
}
