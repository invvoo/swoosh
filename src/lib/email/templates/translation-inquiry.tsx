import {
  Html, Head, Body, Container, Heading, Text, Hr, Section, Row, Column, Button,
} from '@react-email/components'

interface TranslationInquiryEmailProps {
  translatorName: string
  sourceLang: string
  targetLang: string
  wordCount: number
  specialty: string
  turnaroundDays?: number
  quotedRate?: number
  documentName?: string
  adminEmail: string
  adminPhone: string
  interestedUrl: string
  declineUrl: string
}

export function TranslationInquiryEmail({
  translatorName,
  sourceLang,
  targetLang,
  wordCount,
  specialty,
  turnaroundDays,
  quotedRate,
  documentName,
  adminEmail,
  adminPhone,
  interestedUrl,
  declineUrl,
}: TranslationInquiryEmailProps) {
  const langLabel = `${sourceLang} → ${targetLang}`

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', margin: 0 }}>
        <Container style={{ maxWidth: 600, margin: '40px auto', backgroundColor: '#ffffff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#1a1a2e', fontSize: 22, marginBottom: 6 }}>
            Translation Job Availability Inquiry
          </Heading>
          <Text style={{ color: '#555', fontSize: 15, marginBottom: 4 }}>
            Hi {translatorName},
          </Text>
          <Text style={{ color: '#444', fontSize: 15 }}>
            We have a new translation job and would like to know if you are available.
            Please review the details below and click a button to respond.
          </Text>

          <Section style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: '16px 20px', margin: '20px 0' }}>
            <Row style={{ marginBottom: 8 }}>
              <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Language Pair</Text></Column>
              <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0 }}>{langLabel}</Text></Column>
            </Row>
            <Row style={{ marginBottom: 8 }}>
              <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Word Count</Text></Column>
              <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0 }}>{wordCount.toLocaleString()} words</Text></Column>
            </Row>
            <Row style={{ marginBottom: 8 }}>
              <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Specialty</Text></Column>
              <Column><Text style={{ fontSize: 13, margin: 0 }}>{specialty}</Text></Column>
            </Row>
            {documentName && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Document</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0 }}>{documentName}</Text></Column>
              </Row>
            )}
            {turnaroundDays != null && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Turnaround Required</Text></Column>
                <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0, color: '#c05000' }}>{turnaroundDays} business day{turnaroundDays !== 1 ? 's' : ''}</Text></Column>
              </Row>
            )}
            {quotedRate != null && (
              <Row>
                <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Offered Rate</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0 }}>${quotedRate.toFixed(4)}/word</Text></Column>
              </Row>
            )}
          </Section>

          <Text style={{ color: '#444', fontSize: 14, marginBottom: 16 }}>
            Please click one of the buttons below to let us know your availability:
          </Text>

          <Section style={{ textAlign: 'center', margin: '0 0 20px' }}>
            <Button
              href={interestedUrl}
              style={{
                backgroundColor: '#16a34a',
                color: '#ffffff',
                padding: '12px 28px',
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
                marginRight: 12,
              }}
            >
              ✓ Yes, I'm Available
            </Button>
            <Button
              href={declineUrl}
              style={{
                backgroundColor: '#e5e7eb',
                color: '#374151',
                padding: '12px 28px',
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Not Available
            </Button>
          </Section>

          <Hr style={{ margin: '24px 0', borderColor: '#eee' }} />
          <Text style={{ color: '#888', fontSize: 13 }}>
            Questions? Contact us: <a href={`mailto:${adminEmail}`} style={{ color: '#1a1a2e' }}>{adminEmail}</a> · {adminPhone}
            <br />L.A. Translation &amp; Interpretation · 2975 Wilshire Blvd #205, Los Angeles, CA 90010
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
