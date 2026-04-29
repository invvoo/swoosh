import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { notifyAdminNewInquiry } from '@/lib/email/notify-admin'

const schema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  clientCompany: z.string().optional(),
  notaryServiceType: z.enum(['notary', 'apostille', 'both']),
  deliveryMethod: z.enum(['in_person', 'mail']),
  documentDescription: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { clientName, clientEmail, clientPhone, clientCompany, notaryServiceType, deliveryMethod, documentDescription, notes } = parsed.data
  const supabase = createServiceClient()

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .upsert({ contact_name: clientName, email: clientEmail, phone: clientPhone ?? null, company_name: clientCompany ?? null }, { onConflict: 'email' })
    .select('id')
    .single()

  if (clientError || !client) return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      job_type: 'notary',
      status: 'draft',
      client_id: client.id,
      notary_service_type: notaryServiceType,
      delivery_method: deliveryMethod,
      employee_notes: [documentDescription, notes].filter(Boolean).join('\n') || null,
    })
    .select('id')
    .single()

  if (jobError || !job) return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })

  await supabase.from('job_status_history').insert({ job_id: job.id, new_status: 'draft' })

  notifyAdminNewInquiry({
    jobType: 'notary',
    jobId: job.id,
    clientName,
    clientEmail,
    clientPhone,
    notaryServiceType,
    deliveryMethod,
  }).catch((err) => console.error('[notary] Admin notify error:', err))

  return NextResponse.json({ jobId: job.id })
}
