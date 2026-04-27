import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/tokens'
import { createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

interface Props {
  params: Promise<{ token: string }>
}

export async function POST(_req: NextRequest, { params }: Props) {
  const { token } = await params
  const payload = await verifyToken(token)

  if (!payload || payload.type !== 'quote') {
    return NextResponse.json({ error: 'Token expired or invalid' }, { status: 410 })
  }

  const supabase = createServiceClient()
  const { data: job } = await supabase
    .from('jobs')
    .select('id, job_type, status, source_lang, target_lang, quote_amount, quote_adjusted_amount, clients(contact_name, email, stripe_customer_id)')
    .eq('id', payload.jobId)
    .single()

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  if (!['quote_sent', 'quote_accepted'].includes(job.status)) {
    return NextResponse.json({ error: 'Quote is not in an acceptable state' }, { status: 409 })
  }

  const client = job.clients as any
  const amount = Math.round(Number(job.quote_adjusted_amount ?? job.quote_amount) * 100) // cents

  // Get or create Stripe customer
  let stripeCustomerId = client?.stripe_customer_id
  if (!stripeCustomerId && client?.email) {
    const customer = await stripe.customers.create({ name: client.contact_name, email: client.email })
    stripeCustomerId = customer.id
    await supabase.from('clients').update({ stripe_customer_id: stripeCustomerId }).eq('email', client.email)
  }

  const serviceLabel = job.source_lang && job.target_lang
    ? `${job.source_lang} → ${job.target_lang} ${job.job_type}`
    : job.job_type

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: stripeCustomerId ?? undefined,
    customer_email: !stripeCustomerId ? client?.email : undefined,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name: `LA Translation — ${serviceLabel}`,
            description: `Job ID: ${job.id}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { jobId: job.id },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/quote/${token}?cancelled=1`,
  })

  // Mark quote as accepted
  await supabase
    .from('jobs')
    .update({ status: 'quote_accepted', quote_accepted_at: new Date().toISOString() })
    .eq('id', job.id)

  return NextResponse.json({ checkoutUrl: session.url })
}
