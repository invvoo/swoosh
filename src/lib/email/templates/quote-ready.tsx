import {
  Html, Head, Body, Container, Heading, Text, Button, Hr, Section,
} from '@react-email/components'

interface QuoteReadyEmailProps {
  clientName: string
  jobType: string
  sourceLang?: string
  targetLang?: string
  quoteAmount: number
  quoteToken: string
  expiresAt: string
}

export function QuoteReadyEmail({
  clientName,
  jobType,
  sourceLang,
  targetLang,
  quoteAmount,
  quoteToken,
  expiresAt,
}: QuoteReadyEmailProps) {
  const quoteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/quote/${quoteToken}`
  const serviceLabel = sourceLang && targetLang
    ? `${sourceLang} → ${targetLang} ${jobType}`
    : jobType

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
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>
              Quote Amount: ${quoteAmount.toFixed(2)}
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
