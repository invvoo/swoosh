import {
  Html, Head, Body, Container, Heading, Text, Hr, Section, Row, Column,
} from '@react-email/components'

interface TranslationInquiryEmailProps {
  translatorName: string
  sourceLang: string
  targetLang: string
  wordCount: number
  specialty: string
  turnaroundDays?: number
  quotedRate?: number          // per-word rate offered
  documentName?: string
  adminEmail: string
  adminPhone: string
  vendorPortalUrl: string
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
  vendorPortalUrl,
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
            We have a new translation job and would like to know if you are available and can
            confirm your rate. Please review the details below.
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

          <Section style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 8, padding: '12px 20px', margin: '0 0 20px' }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#92400e', margin: '0 0 4px' }}>
              Please reply with:
            </Text>
            <Text style={{ color: '#78350f', fontSize: 13, margin: 0 }}>
              1. Whether you are available to complete this job within the turnaround time<br />
              2. Your rate per word (or confirmation of the offered rate above)
            </Text>
          </Section>

          <Text style={{ color: '#444', fontSize: 14, margin: '0 0 8px' }}>
            Reply to this email or contact us at{' '}
            <a href={`mailto:${adminEmail}`} style={{ color: '#1a1a2e' }}>{adminEmail}</a>
            {' '}/ {adminPhone}
          </Text>
          <Text style={{ color: '#444', fontSize: 14, margin: '0 0 8px' }}>
            <a href={vendorPortalUrl} style={{ color: '#1a1a2e', fontWeight: 'bold' }}>Log in to Vendor Portal →</a>
          </Text>

          <Hr style={{ margin: '24px 0', borderColor: '#eee' }} />
          <Text style={{ color: '#888', fontSize: 13 }}>
            L.A. Translation &amp; Interpretation · 2975 Wilshire Blvd #205, Los Angeles, CA 90010
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
