import {
  Html, Head, Body, Container, Heading, Text, Button, Hr, Section,
} from '@react-email/components'

interface DeliveryReadyEmailProps {
  clientName: string
  jobType: string
  sourceLang?: string
  targetLang?: string
  downloadUrl: string
  invoiceNumber: string
}

export function DeliveryReadyEmail({
  clientName,
  jobType,
  sourceLang,
  targetLang,
  downloadUrl,
  invoiceNumber,
}: DeliveryReadyEmailProps) {
  const serviceLabel = sourceLang && targetLang
    ? `${sourceLang} → ${targetLang} ${jobType}`
    : jobType

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', margin: 0 }}>
        <Container style={{ maxWidth: 600, margin: '40px auto', backgroundColor: '#ffffff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#1a1a2e', fontSize: 24, marginBottom: 8 }}>
            Your Translation is Ready
          </Heading>
          <Text style={{ color: '#444', fontSize: 16 }}>
            Dear {clientName},
          </Text>
          <Text style={{ color: '#444', fontSize: 16 }}>
            Your <strong>{serviceLabel}</strong> has been completed and reviewed by our team.
            You can download your translated document using the button below.
          </Text>
          <Section style={{ backgroundColor: '#f0fff4', borderRadius: 8, padding: '16px 24px', margin: '24px 0' }}>
            <Text style={{ fontSize: 14, color: '#555', margin: 0 }}>
              Invoice: <strong>{invoiceNumber}</strong>
            </Text>
            <Text style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
              Your document download link is valid for 30 days.
            </Text>
          </Section>
          <Button
            href={downloadUrl}
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
            Download Your Translation
          </Button>
          <Hr style={{ margin: '32px 0', borderColor: '#eee' }} />
          <Text style={{ color: '#888', fontSize: 13 }}>
            This translation has been certified and is kept on file for 3 years.
            <br />
            Questions? Call (213) 385-7781 or email info@latranslation.com.
            <br />
            L.A. Translation &amp; Interpretation · 2975 Wilshire Blvd #205, Los Angeles, CA 90010
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
