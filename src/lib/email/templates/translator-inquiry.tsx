import {
  Html, Head, Body, Container, Heading, Text, Hr, Section, Row, Column,
} from '@react-email/components'

interface TranslatorInquiryEmailProps {
  interpreterName: string
  sourceLang: string
  targetLang: string
  scheduledAt?: string
  durationMinutes?: number
  locationType?: string
  locationDetails?: string
  interpretationMode?: string
  certRequired?: string
  clientType?: string   // 'legal' | 'medical' | 'business' | 'conference' etc.
  adminEmail: string
  adminPhone: string
  vendorPortalUrl: string
}

export function TranslatorInquiryEmail({
  interpreterName,
  sourceLang,
  targetLang,
  scheduledAt,
  durationMinutes,
  locationType,
  locationDetails,
  interpretationMode,
  certRequired,
  adminEmail,
  adminPhone,
  vendorPortalUrl,
}: TranslatorInquiryEmailProps) {
  const langLabel = `${sourceLang} → ${targetLang}`
  const locationLabel = locationType === 'in_person' ? 'In-Person'
    : locationType === 'phone' ? 'Phone'
    : 'Video / Remote'
  const modeLabel = interpretationMode === 'simultaneous' ? 'Simultaneous' : 'Consecutive'
  const certLabel = certRequired === 'court' ? 'Court-Certified Required'
    : certRequired === 'medical' ? 'Medical-Certified Required (CCHI/NB)'
    : undefined

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', margin: 0 }}>
        <Container style={{ maxWidth: 600, margin: '40px auto', backgroundColor: '#ffffff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#1a1a2e', fontSize: 22, marginBottom: 6 }}>
            Interpreter Availability Inquiry
          </Heading>
          <Text style={{ color: '#555', fontSize: 15, marginBottom: 4 }}>
            Hi {interpreterName},
          </Text>
          <Text style={{ color: '#444', fontSize: 15 }}>
            We have a new interpretation assignment and would like to know if you are available.
            Please review the details below and reply to this email or contact us directly.
          </Text>

          <Section style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: '16px 20px', margin: '20px 0' }}>
            <Row style={{ marginBottom: 8 }}>
              <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Language Pair</Text></Column>
              <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0 }}>{langLabel}</Text></Column>
            </Row>
            <Row style={{ marginBottom: 8 }}>
              <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Mode</Text></Column>
              <Column><Text style={{ fontSize: 13, margin: 0 }}>{modeLabel}</Text></Column>
            </Row>
            <Row style={{ marginBottom: 8 }}>
              <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Format</Text></Column>
              <Column><Text style={{ fontSize: 13, margin: 0 }}>{locationLabel}</Text></Column>
            </Row>
            {scheduledAt && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Date &amp; Time</Text></Column>
                <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0 }}>{scheduledAt}</Text></Column>
              </Row>
            )}
            {durationMinutes && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Duration</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0 }}>{durationMinutes} minutes</Text></Column>
              </Row>
            )}
            {locationDetails && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Location / Link</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0 }}>{locationDetails}</Text></Column>
              </Row>
            )}
            {certLabel && (
              <Row>
                <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Certification</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0, color: '#c05000', fontWeight: 'bold' }}>{certLabel}</Text></Column>
              </Row>
            )}
          </Section>

          <Section style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 8, padding: '12px 20px', margin: '0 0 20px' }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#92400e', margin: '0 0 4px' }}>Are you available?</Text>
            <Text style={{ color: '#78350f', fontSize: 13, margin: 0 }}>
              Reply to this email to let us know, or call us at {adminPhone}. You can also log into your vendor portal to confirm.
            </Text>
          </Section>

          <Text style={{ color: '#444', fontSize: 14, margin: '0 0 8px' }}>
            <a href={vendorPortalUrl} style={{ color: '#1a1a2e', fontWeight: 'bold' }}>Log in to Vendor Portal →</a>
          </Text>

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
