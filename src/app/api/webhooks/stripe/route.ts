import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import { signToken } from '@/lib/tokens'
import { translateDocument } from '@/lib/ai/translate'
import { extractWordCount } from '@/lib/pdf/word-counter'
import { getResend, FROM_EMAIL } from '@/lib/email/client'
import { AiDraftReadyEmail } from '@/lib/email/templates/ai-draft-ready'
import { JobConfirmedEmail } from '@/lib/email/templates/job-confirmed'
import { render as renderAsync } from '@react-email/components'
import { Document, Paragraph, TextRun, Packer } from 'docx'
import { addDays } from 'date-fns'

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
      .select('id, job_type, status, stripe_checkout_session_id, source_lang, target_lang, document_path, document_name, word_count, specialty_multipliers:specialty_id(name), clients(contact_name, email), quote_amount, quote_adjusted_amount, scheduled_at, duration_minutes, location_type, location_details')
      .eq('id', jobId)
      .single()

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

    // If it's a translation job, trigger AI translation
    if (job.job_type === 'translation' && job.document_path) {
      await supabase.from('jobs').update({ status: 'ai_translating', ai_translation_started_at: new Date().toISOString() }).eq('id', jobId)
      await supabase.from('job_status_history').insert({ job_id: jobId, old_status: 'paid', new_status: 'ai_translating' })

      try {
        // Download original document
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('job-documents')
          .download(job.document_path)

        if (downloadError || !fileData) throw new Error('Failed to download document')

        const buffer = Buffer.from(await fileData.arrayBuffer())
        const text = await extractWordCount(buffer, job.document_name ?? 'document.docx').then(async () => {
          // Re-extract text for translation
          if ((job.document_name ?? '').toLowerCase().endsWith('.docx') || (job.document_name ?? '').toLowerCase().endsWith('.doc')) {
            const mammoth = await import('mammoth')
            const result = await mammoth.extractRawText({ buffer })
            return result.value
          } else if ((job.document_name ?? '').toLowerCase().endsWith('.pdf')) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
            const data = await pdfParse(buffer)
            return data.text
          }
          return buffer.toString('utf-8')
        })

        const specialtyName = (job.specialty_multipliers as any)?.name ?? 'General'
        const translatedText = await translateDocument(text, job.source_lang!, job.target_lang!, specialtyName)

        // Create docx from translated text
        const doc = new Document({
          sections: [{
            children: translatedText.split('\n').map(line =>
              new Paragraph({ children: [new TextRun(line)] })
            ),
          }],
        })
        const docBuffer = await Packer.toBuffer(doc)

        const aiDraftPath = `documents/ai-draft/${jobId}/ai_draft.docx`
        await supabase.storage.from('job-documents').upload(aiDraftPath, docBuffer, { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', upsert: true })

        await supabase
          .from('jobs')
          .update({ status: 'ai_review_pending', ai_draft_path: aiDraftPath, ai_translation_completed_at: new Date().toISOString() })
          .eq('id', jobId)

        await supabase.from('job_status_history').insert({ job_id: jobId, old_status: 'ai_translating', new_status: 'ai_review_pending' })

        // Notify employees
        const { data: employees } = await supabase.from('employees').select('id').eq('is_active', true)
        // Send to first admin email from env as fallback
        const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL
        if (notifyEmail) {
          const html = await renderAsync(AiDraftReadyEmail({
            jobId,
            clientName: client?.contact_name ?? 'Client',
            sourceLang: job.source_lang!,
            targetLang: job.target_lang!,
            wordCount: job.word_count ?? 0,
          }))
          await getResend().emails.send({ from: FROM_EMAIL, to: notifyEmail, subject: `AI Draft Ready — ${invoiceNumber}`, html })
        }

      } catch (aiError) {
        console.error('AI translation failed:', aiError)
        await supabase.from('jobs').update({ status: 'ai_failed' }).eq('id', jobId)
        await supabase.from('job_status_history').insert({ job_id: jobId, old_status: 'ai_translating', new_status: 'ai_failed', note: String(aiError) })
      }
    }
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
