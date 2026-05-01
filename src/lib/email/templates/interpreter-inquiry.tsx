import {
  Html, Head, Body, Container, Heading, Text, Button, Hr, Section, Row, Column,
} from '@react-email/components'

interface InterpreterInquiryEmailProps {
  interpreterName: string
  sourceLang: string
  targetLang: string
  assignmentType?: string
  scheduledAt?: string
  durationMinutes?: number
  locationType?: string
  locationDetails?: string
  interpretationMode?: string
  certRequired?: string
  adminEmail: string
  adminPhone: string
  respondUrl: string  // unique token link to the bid response page
}

const ASSIGNMENT_LABELS: Record<string, string> = {
  conference:        'Conference / Large Event',
  business_meeting:  'Business Meeting',
  attorney_client:   'Attorney-Client Meeting',
  hospital_visit:    'Hospital / Medical Visit',
  court_trial:       'Court Trial / Hearing',
  deposition:        'Deposition',
  other:             'Other',
}

const LOCATION_LABELS: Record<string, string> = {
  in_person: 'In-Person',
  video:     'Remote / Video Call',
  phone:     'Over the Phone',
}

export function InterpreterInquiryEmail({
  interpreterName,
  sourceLang,
  targetLang,
  assignmentType,
  scheduledAt,
  durationMinutes,
  locationType,
  locationDetails,
  interpretationMode,
  certRequired,
  adminEmail,
  adminPhone,
  respondUrl,
}: InterpreterInquiryEmailProps) {
  const langLabel = `${sourceLang} → ${targetLang}`

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', margin: 0 }}>
        <Container style={{ maxWidth: 600, margin: '40px auto', backgroundColor: '#ffffff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#1a1a2e', fontSize: 22, marginBottom: 6 }}>
            Interpretation Assignment Inquiry
          </Heading>
          <Text style={{ color: '#555', fontSize: 15, marginBottom: 4 }}>
            Hi {interpreterName},
          </Text>
          <Text style={{ color: '#444', fontSize: 15 }}>
            We have a new interpretation assignment and would like to know if you are available.
            Please review the details below and let us know.
          </Text>

          <Section style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: '16px 20px', margin: '20px 0' }}>
            <Row style={{ marginBottom: 8 }}>
              <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Language Pair</Text></Column>
              <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0 }}>{langLabel}</Text></Column>
            </Row>
            {assignmentType && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Assignment Type</Text></Column>
                <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0 }}>{ASSIGNMENT_LABELS[assignmentType] ?? assignmentType}</Text></Column>
              </Row>
            )}
            {scheduledAt && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Date &amp; Time</Text></Column>
                <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0, color: '#1a1a2e' }}>{scheduledAt}</Text></Column>
              </Row>
            )}
            {durationMinutes && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Duration</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0 }}>{durationMinutes} minutes</Text></Column>
              </Row>
            )}
            {locationType && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Format</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0 }}>{LOCATION_LABELS[locationType] ?? locationType}</Text></Column>
              </Row>
            )}
            {locationDetails && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Location</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0 }}>{locationDetails}</Text></Column>
              </Row>
            )}
            {interpretationMode && interpretationMode !== 'consecutive' && (
              <Row style={{ marginBottom: 8 }}>
                <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Mode</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0, textTransform: 'capitalize' }}>{interpretationMode}</Text></Column>
              </Row>
            )}
            {certRequired && certRequired !== 'none' && (
              <Row>
                <Column style={{ width: '44%' }}><Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Certification</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0, fontWeight: 'bold', color: '#c05000' }}>
                  {certRequired === 'court' ? 'Court-Certified Required' : 'Medical-Certified (CCHI/NB) Required'}
                </Text></Column>
              </Row>
            )}
          </Section>

          <Section style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '16px 20px', margin: '0 0 24px' }}>
            <Text style={{ fontSize: 14, color: '#166534', margin: '0 0 12px', fontWeight: 'bold' }}>
              Are you available for this assignment?
            </Text>
            <Text style={{ fontSize: 13, color: '#166534', margin: '0 0 16px' }}>
              Click the button below to confirm your availability and enter your rate.
              This takes less than a minute.
            </Text>
            <Button
              href={respondUrl}
              style={{
                backgroundColor: '#16a34a',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Yes, I&apos;m Available →
            </Button>
          </Section>

          <Text style={{ color: '#888', fontSize: 13, margin: '0 0 4px' }}>
            Not available for this one?{' '}
            <a href={`${respondUrl}?decline=1`} style={{ color: '#dc2626' }}>Click here to decline</a>
          </Text>

          <Hr style={{ margin: '24px 0', borderColor: '#eee' }} />
          <Text style={{ color: '#888', fontSize: 13 }}>
            Questions? Contact us at{' '}
            <a href={`mailto:${adminEmail}`} style={{ color: '#1a1a2e' }}>{adminEmail}</a>
            {' '}or {adminPhone}
            <br />
            L.A. Translation &amp; Interpretation · 2975 Wilshire Blvd #205, Los Angeles, CA 90010
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
