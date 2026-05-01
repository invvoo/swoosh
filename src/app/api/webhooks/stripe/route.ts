import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL } from '@/lib/email/client'
import { JobConfirmedEmail } from '@/lib/email/templates/job-confirmed'
import { render as renderAsync } from '@react-email/components'
import { triggerPostPaymentActions } from '@/lib/jobs/post-payment'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const jobId = session.metadata?.jobId

    if (!jobId) return NextResponse.json({ ok: true })

    // Idempotency check
    const { data: job } = await supabase
      .from('jobs')
      .select('id, job_type, status, stripe_checkout_session_id, source_lang, target_lang, document_path, document_name, word_count, invoice_number, quote_amount, quote_adjusted_amount, scheduled_at, duration_minutes, location_type, location_details, interpretation_mode, interpretation_cert_required, specialty_multipliers:specialty_id(name), clients(contact_name, email)')
      .eq('id', jobId)
      .single() as any

    if (!job) return NextResponse.json({ ok: true })
    if (job.stripe_checkout_session_id === session.id) {
      // Already processed
      return NextResponse.json({ ok: true })
    }

    // Generate invoice number
    const { data: invoiceData } = await supabase.rpc('generate_invoice_number')
    const invoiceNumber = invoiceData as string

    // Update job to paid
    await supabase
      .from('jobs')
      .update({
        status: 'paid',
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        invoice_number: invoiceNumber,
        invoice_issued_at: new Date().toISOString(),
        payment_collected_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    await supabase.from('job_status_history').insert({ job_id: jobId, old_status: job.status, new_status: 'paid', note: `Payment received — ${invoiceNumber}` })

    const client = job.clients as any
    const amount = Number(job.quote_adjusted_amount ?? job.quote_amount)

    // Send confirmation email to client
    if (client?.email) {
      try {
        const specialty = job.specialty_multipliers as any
        const html = await renderAsync(JobConfirmedEmail({
          clientName: client.contact_name,
          jobType: job.job_type,
          sourceLang: job.source_lang ?? undefined,
          targetLang: job.target_lang ?? undefined,
          scheduledAt: job.scheduled_at ? new Date(job.scheduled_at).toLocaleString('en-US') : undefined,
          durationMinutes: job.duration_minutes ?? undefined,
          locationType: job.location_type ?? undefined,
          locationDetails: job.location_details ?? undefined,
          invoiceNumber,
          amount,
        }))

        const { data: emailData, error: emailError } = await getResend().emails.send({
          from: FROM_EMAIL,
          to: client.email,
          subject: `Booking Confirmed — ${invoiceNumber}`,
          html,
        })

        await supabase.from('email_log').insert({
          job_id: jobId,
          email_type: 'job_confirmed',
          recipient: client.email,
          subject: `Booking Confirmed — ${invoiceNumber}`,
          resend_id: emailData?.id ?? null,
          status: emailError ? 'failed' : 'sent',
          error_message: emailError ? String(emailError) : null,
        })
      } catch (e) {
        console.error('Confirmation email failed:', e)
      }
    }

    // Trigger post-payment actions (AI translation, interpreter outreach, admin notify)
    await triggerPostPaymentActions(supabase, { ...job, invoice_number: invoiceNumber }, invoiceNumber)
  }

  if (event.type === 'transfer.created') {
    const transfer = event.data.object as any
    await supabase
      .from('translator_invoices')
      .update({ stripe_transfer_id: transfer.id, status: 'paid', paid_at: new Date().toISOString() })
      .eq('stripe_transfer_id', transfer.id)
  }

  if ((event.type as string) === 'transfer.failed') {
    const transfer = (event.data as any).object
    await supabase
      .from('translator_invoices')
      .update({ status: 'failed' })
      .eq('stripe_transfer_id', transfer.id)
  }

  return NextResponse.json({ ok: true })
}
