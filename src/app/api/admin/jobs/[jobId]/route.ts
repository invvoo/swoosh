import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ jobId: string }>
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('jobs').delete().eq('id', jobId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { note } = await req.json()
  const { error } = await (supabase as any).from('jobs').update({ employee_notes: note ?? null }).eq('id', jobId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
