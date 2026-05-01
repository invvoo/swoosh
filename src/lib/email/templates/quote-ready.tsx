import {
  Html, Head, Body, Container, Heading, Text, Button, Hr, Section,
} from '@react-email/components'

interface QuoteReadyEmailProps {
  clientName: string
  jobType: string
  sourceLang?: string
  targetLang?: string
  quoteAmount: number
  discountAmount?: number
  discountLabel?: string
  quoteUrl: string
  expiresAt: string
}

export function QuoteReadyEmail({
  clientName,
  jobType,
  sourceLang,
  targetLang,
  quoteAmount,
  discountAmount,
  discountLabel,
  quoteUrl,
  expiresAt,
}: QuoteReadyEmailProps) {
  const serviceLabel = sourceLang && targetLang
    ? `${sourceLang} → ${targetLang} ${jobType}`
    : jobType

  const hasDiscount = discountAmount != null && discountAmount > 0
  const finalAmount = hasDiscount ? Math.max(0, quoteAmount - discountAmount!) : quoteAmount

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', margin: 0 }}>
        <Container style={{ maxWidth: 600, margin: '40px auto', backgroundColor: '#ffffff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#1a1a2e', fontSize: 24, marginBottom: 8 }}>
            Your Quote is Ready
          </Heading>
          <Text style={{ color: '#444', fontSize: 16 }}>
            Dear {clientName},
          </Text>
          <Text style={{ color: '#444', fontSize: 16 }}>
            Thank you for choosing L.A. Translation &amp; Interpretation. We have prepared a quote
            for your <strong>{serviceLabel}</strong> request.
          </Text>
          <Section style={{ backgroundColor: '#f0f4ff', borderRadius: 8, padding: '16px 24px', margin: '24px 0' }}>
            {hasDiscount && (
              <>
                <Text style={{ fontSize: 14, color: '#666', margin: '0 0 4px' }}>
                  Subtotal: ${quoteAmount.toFixed(2)}
                </Text>
                <Text style={{ fontSize: 14, color: '#166534', margin: '0 0 8px' }}>
                  {discountLabel || 'Discount'}: −${discountAmount!.toFixed(2)}
                </Text>
              </>
            )}
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>
              {hasDiscount ? 'Total After Discount' : 'Quote Amount'}: ${finalAmount.toFixed(2)}
            </Text>
            <Text style={{ color: '#666', fontSize: 14, margin: '8px 0 0' }}>
              This quote expires on {expiresAt}
            </Text>
          </Section>
          <Button
            href={quoteUrl}
            style={{
              backgroundColor: '#1a1a2e',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: 6,
              fontSize: 16,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            View &amp; Accept Quote
          </Button>
          <Hr style={{ margin: '32px 0', borderColor: '#eee' }} />
          <Text style={{ color: '#888', fontSize: 12, margin: '0 0 8px' }}>
            <strong style={{ color: '#555' }}>Cancellation Policy:</strong> Cancellations made within
            48 business hours of the scheduled service or accepted quote are subject to the full quoted
            fee. No refunds will be issued for cancellations within this window.
          </Text>
          <Text style={{ color: '#888', fontSize: 13 }}>
            Questions? Call us at (213) 385-7781 or reply to this email at info@latranslation.com.
            <br />
            L.A. Translation &amp; Interpretation · 2975 Wilshire Blvd #205, Los Angeles, CA 90010
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
