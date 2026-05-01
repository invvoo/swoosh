import {
  Html, Head, Body, Container, Heading, Text, Hr, Section,
} from '@react-email/components'

interface JobConfirmedEmailProps {
  clientName: string
  jobType: string
  scheduledAt?: string
  durationMinutes?: number
  locationType?: string
  locationDetails?: string
  sourceLang?: string
  targetLang?: string
  invoiceNumber: string
  amount: number
}

export function JobConfirmedEmail({
  clientName,
  jobType,
  scheduledAt,
  durationMinutes,
  locationType,
  locationDetails,
  sourceLang,
  targetLang,
  invoiceNumber,
  amount,
}: JobConfirmedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', margin: 0 }}>
        <Container style={{ maxWidth: 600, margin: '40px auto', backgroundColor: '#ffffff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#1a1a2e', fontSize: 24, marginBottom: 8 }}>
            Order Confirmed
          </Heading>
          <Text style={{ color: '#444', fontSize: 16 }}>
            Dear {clientName},
          </Text>
          <Text style={{ color: '#444', fontSize: 16 }}>
            Your <strong>{jobType}</strong> order with L.A. Translation &amp; Interpretation has been
            confirmed. Here are the details:
          </Text>
          <Section style={{ backgroundColor: '#f0f4ff', borderRadius: 8, padding: '16px 24px', margin: '24px 0' }}>
            {sourceLang && targetLang && (
              <Text style={{ margin: '0 0 8px', fontSize: 15 }}>
                <strong>Languages:</strong> {sourceLang} → {targetLang}
              </Text>
            )}
            {scheduledAt && (
              <Text style={{ margin: '0 0 8px', fontSize: 15 }}>
                <strong>Date &amp; Time:</strong> {scheduledAt}
              </Text>
            )}
            {durationMinutes && (
              <Text style={{ margin: '0 0 8px', fontSize: 15 }}>
                <strong>Duration:</strong> {durationMinutes} minutes
              </Text>
            )}
            {locationType && (
              <Text style={{ margin: '0 0 8px', fontSize: 15 }}>
                <strong>Format:</strong> {locationType.replace('_', ' ')}
              </Text>
            )}
            {locationDetails && (
              <Text style={{ margin: '0 0 8px', fontSize: 15 }}>
                <strong>Location:</strong> {locationDetails}
              </Text>
            )}
            <Text style={{ margin: '8px 0 0', fontSize: 15 }}>
              <strong>Amount Paid:</strong> ${amount.toFixed(2)} · Invoice {invoiceNumber}
            </Text>
          </Section>
          <Hr style={{ margin: '32px 0', borderColor: '#eee' }} />
          <Text style={{ color: '#888', fontSize: 13 }}>
            Need to make changes? Call (213) 385-7781 or email info@latranslation.com.
            <br />
            L.A. Translation &amp; Interpretation · 2975 Wilshire Blvd #205, Los Angeles, CA 90010
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
