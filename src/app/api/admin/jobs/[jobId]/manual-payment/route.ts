import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  method: z.enum(['cash', 'check', 'zelle', 'venmo', 'wire', 'other']),
  note: z.string().max(500).optional(),
})

interface Props { params: Promise<{ jobId: string }> }

export async function POST(req: NextRequest, { params }: Props) {
  const { jobId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 422 })
  const { method, note } = parsed.data

  const service = createServiceClient()

  const { data: job } = await (service as any)
    .from('jobs')
    .select('id, status, job_type, invoice_number, quote_amount, quote_adjusted_amount, clients(contact_name, email)')
    .eq('id', jobId)
    .single()

  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Only allow manual payment if job is in quote_accepted or draft/confirmed (hasn't been paid yet)
  const payableStatuses = ['draft', 'quote_sent', 'quote_accepted', 'confirmed']
  if (!payableStatuses.includes(job.status)) {
    return NextResponse.json({ error: `Cannot record payment on a job with status "${job.status}"` }, { status: 409 })
  }

  // Generate invoice number if not already set
  let invoiceNumber = job.invoice_number
  if (!invoiceNumber) {
    const { data } = await service.rpc('generate_invoice_number')
    invoiceNumber = data as string
  }

  const methodLabel: Record<string, string> = {
    cash: 'Cash', check: 'Check', zelle: 'Zelle',
    venmo: 'Venmo', wire: 'Wire Transfer', other: 'Other',
  }

  // Advance to 'paid' (for interpretation/notary) or next appropriate status
  const nextStatus = job.job_type === 'translation' ? 'paid' : 'paid'

  await service.from('jobs').update({
    status: nextStatus,
    invoice_number: invoiceNumber,
    invoice_issued_at: new Date().toISOString(),
    payment_collected_at: new Date().toISOString(),
    payment_method: `manual:${method}`,
  } as any).eq('id', jobId)

  await service.from('job_status_history').insert({
    job_id: jobId,
    old_status: job.status,
    new_status: nextStatus,
    changed_by: user.id,
    note: `Manual payment recorded — ${methodLabel[method]}${note ? ` · ${note}` : ''} · ${invoiceNumber}`,
  })

  return NextResponse.json({ ok: true, invoiceNumber, nextStatus })
}
