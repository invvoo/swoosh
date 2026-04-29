import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

interface Props { params: Promise<{ jobId: string }> }

export async function POST(_req: NextRequest, { params }: Props) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: client } = await service
    .from('clients')
    .select('id, contact_name, email, stripe_customer_id')
    .eq('email', user.email)
    .maybeSingle()
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const { data: job } = await service
    .from('jobs')
    .select('id, job_type, status, source_lang, target_lang, quote_amount, quote_adjusted_amount')
    .eq('id', jobId)
    .eq('client_id', client.id)
    .single()

  if (!job) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (!['quote_sent', 'quote_accepted'].includes(job.status)) {
    return NextResponse.json({ error: 'This quote is not available for payment' }, { status: 409 })
  }

  const amount = Math.round(Number(job.quote_adjusted_amount ?? job.quote_amount) * 100)
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid quote amount — contact us to confirm pricing' }, { status: 400 })

  // Get or create Stripe customer
  let stripeCustomerId = (client as any).stripe_customer_id as string | null
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ name: (client as any).contact_name, email: client.email })
    stripeCustomerId = customer.id
    await service.from('clients').update({ stripe_customer_id: stripeCustomerId } as any).eq('id', client.id)
  }

  const serviceLabel = job.source_lang && job.target_lang
    ? `${job.source_lang} → ${job.target_lang} ${job.job_type}`
    : (job.job_type as string)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: stripeCustomerId,
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: amount,
        product_data: {
          name: `LA Translation — ${serviceLabel}`,
          description: `Order ID: ${job.id}`,
        },
      },
      quantity: 1,
    }],
    metadata: { jobId: job.id },
    success_url: `${baseUrl}/client/jobs/${job.id}?paid=1`,
    cancel_url: `${baseUrl}/client/jobs/${job.id}`,
  })

  await service.from('jobs')
    .update({ status: 'quote_accepted', quote_accepted_at: new Date().toISOString() } as any)
    .eq('id', job.id)

  return NextResponse.json({ checkoutUrl: session.url })
}
