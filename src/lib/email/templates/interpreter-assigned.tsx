import {
  Html, Head, Body, Container, Heading, Text, Hr, Section, Row, Column,
} from '@react-email/components'

interface InterpreterAssignedEmailProps {
  interpreterName: string
  clientName: string
  poNumber: string
  scheduledAt: string        // formatted date/time string
  estimatedEndTime?: string  // formatted
  durationMinutes?: number
  sourceLang: string
  targetLang: string
  locationType: string       // 'in_person' | 'phone' | 'video'
  locationDetails?: string
  interpretationMode?: string // 'consecutive' | 'simultaneous'
  certRequired?: string
  adminEmail?: string
  adminPhone?: string
  specialInstructions?: string
  jobPortalUrl: string
}

export function InterpreterAssignedEmail({
  interpreterName,
  clientName,
  poNumber,
  scheduledAt,
  estimatedEndTime,
  durationMinutes,
  sourceLang,
  targetLang,
  locationType,
  locationDetails,
  interpretationMode,
  certRequired,
  adminEmail,
  adminPhone,
  specialInstructions,
  jobPortalUrl,
}: InterpreterAssignedEmailProps) {
  const locationLabel = locationType === 'in_person' ? 'In-Person'
    : locationType === 'phone' ? 'Phone'
    : 'Video / Remote'

  const certLabel = certRequired === 'court' ? 'Court-Certified Required'
    : certRequired === 'medical' ? 'Medical-Certified Required (CCHI/NB)'
    : 'No special certification required'

  const modeLabel = interpretationMode === 'simultaneous' ? 'Simultaneous'
    : 'Consecutive'

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', margin: 0 }}>
        <Container style={{ maxWidth: 600, margin: '40px auto', backgroundColor: '#ffffff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#1a1a2e', fontSize: 22, marginBottom: 6 }}>
            Interpretation Assignment
          </Heading>
          <Text style={{ color: '#666', fontSize: 15, marginBottom: 4 }}>
            Dear {interpreterName},
          </Text>
          <Text style={{ color: '#444', fontSize: 15 }}>
            You have been assigned to the following interpretation job. Please review the details below and confirm your availability.
          </Text>

          {/* PO Number — prominent */}
          <Section style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: '12px 20px', margin: '20px 0' }}>
            <Text style={{ color: '#fff', fontSize: 14, margin: 0, fontWeight: 'bold' }}>
              PO Number: <span style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{poNumber}</span>
            </Text>
            <Text style={{ color: '#aab', fontSize: 12, margin: '4px 0 0' }}>
              Reference this PO number on your invoice.
            </Text>
          </Section>

          {/* Assignment details */}
          <Section style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: '16px 20px', margin: '0 0 20px' }}>
            <Row style={{ marginBottom: 8 }}>
              <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Client</Text></Column>
              <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0 }}>{clientName}</Text></Column>
            </Row>
            <Row style={{ marginBottom: 8 }}>
              <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Date &amp; Time</Text></Column>
              <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0 }}>{scheduledAt}</Text></Column>
            </Row>
            {estimatedEndTime && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Est. End Time</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0 }}>{estimatedEndTime}</Text></Column>
              </Row>
            )}
            {durationMinutes && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Duration</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0 }}>{durationMinutes} minutes</Text></Column>
              </Row>
            )}
            <Row style={{ marginBottom: 8 }}>
              <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Language Pair</Text></Column>
              <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0 }}>{sourceLang} → {targetLang}</Text></Column>
            </Row>
            <Row style={{ marginBottom: 8 }}>
              <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Format</Text></Column>
              <Column><Text style={{ fontSize: 13, margin: 0 }}>{locationLabel}</Text></Column>
            </Row>
            {locationDetails && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Location / Link</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0 }}>{locationDetails}</Text></Column>
              </Row>
            )}
            <Row style={{ marginBottom: 8 }}>
              <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Mode</Text></Column>
              <Column><Text style={{ fontSize: 13, margin: 0 }}>{modeLabel}</Text></Column>
            </Row>
            <Row>
              <Column style={{ width: '40%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Certification</Text></Column>
              <Column><Text style={{ fontSize: 13, margin: 0 }}>{certLabel}</Text></Column>
            </Row>
          </Section>

          {specialInstructions && (
            <Section style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 8, padding: '12px 20px', margin: '0 0 20px' }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#92400e', margin: '0 0 4px' }}>Special Instructions</Text>
              <Text style={{ color: '#78350f', fontSize: 13, margin: 0 }}>{specialInstructions}</Text>
            </Section>
          )}

          <Text style={{ color: '#444', fontSize: 14, margin: '0 0 8px' }}>
            <a href={jobPortalUrl} style={{ color: '#1a1a2e', fontWeight: 'bold' }}>View job details in your portal →</a>
          </Text>

          <Hr style={{ margin: '24px 0', borderColor: '#eee' }} />

          <Text style={{ color: '#888', fontSize: 13 }}>
            Questions? Contact our coordination team:{' '}
            {adminEmail && <><a href={`mailto:${adminEmail}`} style={{ color: '#1a1a2e' }}>{adminEmail}</a><br /></>}
            {adminPhone ? adminPhone : '(213) 385-7781'}
            <br /><br />
            L.A. Translation &amp; Interpretation · 2975 Wilshire Blvd #205, Los Angeles, CA 90010
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
