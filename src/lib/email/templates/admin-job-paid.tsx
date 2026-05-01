import {
  Html, Head, Body, Container, Heading, Text, Hr, Section, Row, Column,
} from '@react-email/components'

interface ContactedTranslator {
  name: string
  email: string
}

interface AdminJobPaidEmailProps {
  jobType: 'interpretation' | 'notary' | 'equipment_rental' | 'translation'
  jobId: string
  invoiceNumber: string
  clientName: string
  amount: number
  sourceLang?: string
  targetLang?: string
  scheduledAt?: string
  durationMinutes?: number
  locationType?: string
  interpretationMode?: string
  certRequired?: string
  adminPortalUrl: string
  assignUrl: string
  contactedTranslators?: ContactedTranslator[]
  matchingTranslatorCount?: number
  nextStepLabel: string
}

export function AdminJobPaidEmail({
  jobType,
  jobId,
  invoiceNumber,
  clientName,
  amount,
  sourceLang,
  targetLang,
  scheduledAt,
  durationMinutes,
  locationType,
  interpretationMode,
  certRequired,
  adminPortalUrl,
  assignUrl,
  contactedTranslators = [],
  matchingTranslatorCount = 0,
  nextStepLabel,
}: AdminJobPaidEmailProps) {
  const jobTypeLabel = jobType === 'interpretation' ? 'Interpretation'
    : jobType === 'notary' ? 'Notary / Apostille'
    : jobType === 'equipment_rental' ? 'Equipment Rental'
    : 'Translation'

  const langLabel = sourceLang && targetLang ? `${sourceLang} → ${targetLang}` : undefined

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', margin: 0 }}>
        <Container style={{ maxWidth: 600, margin: '40px auto', backgroundColor: '#ffffff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#1a1a2e', fontSize: 22, marginBottom: 6 }}>
            Payment Received — {jobTypeLabel} Job
          </Heading>
          <Text style={{ color: '#444', fontSize: 15 }}>
            A client has completed payment. Here are the details and your next step.
          </Text>

          {/* Key info */}
          <Section style={{ backgroundColor: '#f0f4ff', borderRadius: 8, padding: '16px 20px', margin: '20px 0' }}>
            <Row style={{ marginBottom: 6 }}>
              <Column style={{ width: '40%' }}><Text style={{ color: '#666', fontSize: 13, margin: 0 }}>Invoice</Text></Column>
              <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0, fontFamily: 'monospace' }}>{invoiceNumber}</Text></Column>
            </Row>
            <Row style={{ marginBottom: 6 }}>
              <Column style={{ width: '40%' }}><Text style={{ color: '#666', fontSize: 13, margin: 0 }}>Client</Text></Column>
              <Column><Text style={{ fontSize: 13, margin: 0 }}>{clientName}</Text></Column>
            </Row>
            <Row style={{ marginBottom: 6 }}>
              <Column style={{ width: '40%' }}><Text style={{ color: '#666', fontSize: 13, margin: 0 }}>Amount Paid</Text></Column>
              <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0, color: '#166534' }}>${amount.toFixed(2)}</Text></Column>
            </Row>
            {langLabel && (
              <Row style={{ marginBottom: 6 }}>
                <Column style={{ width: '40%' }}><Text style={{ color: '#666', fontSize: 13, margin: 0 }}>Languages</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0 }}>{langLabel}</Text></Column>
              </Row>
            )}
            {interpretationMode && (
              <Row style={{ marginBottom: 6 }}>
                <Column style={{ width: '40%' }}><Text style={{ color: '#666', fontSize: 13, margin: 0 }}>Mode</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0, textTransform: 'capitalize' }}>{interpretationMode}</Text></Column>
              </Row>
            )}
            {scheduledAt && (
              <Row style={{ marginBottom: 6 }}>
                <Column style={{ width: '40%' }}><Text style={{ color: '#666', fontSize: 13, margin: 0 }}>Scheduled</Text></Column>
                <Column><Text style={{ fontWeight: 'bold', fontSize: 13, margin: 0 }}>{scheduledAt}</Text></Column>
              </Row>
            )}
            {durationMinutes && (
              <Row style={{ marginBottom: 6 }}>
                <Column style={{ width: '40%' }}><Text style={{ color: '#666', fontSize: 13, margin: 0 }}>Duration</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0 }}>{durationMinutes} min</Text></Column>
              </Row>
            )}
            {certRequired && certRequired !== 'none' && (
              <Row>
                <Column style={{ width: '40%' }}><Text style={{ color: '#666', fontSize: 13, margin: 0 }}>Cert Required</Text></Column>
                <Column><Text style={{ fontSize: 13, margin: 0, color: '#c05000', fontWeight: 'bold' }}>
                  {certRequired === 'court' ? 'Court-Certified' : 'Medical (CCHI/NB)'}
                </Text></Column>
              </Row>
            )}
          </Section>

          {/* Next step */}
          <Section style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: '14px 20px', margin: '0 0 20px' }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', margin: '0 0 4px' }}>
              Next Step: {nextStepLabel}
            </Text>
            <Text style={{ color: '#aab', fontSize: 13, margin: 0 }}>
              <a href={assignUrl} style={{ color: '#7dd3fc' }}>Open job in admin portal →</a>
            </Text>
          </Section>

          {/* Interpreter outreach summary */}
          {contactedTranslators.length > 0 && (
            <Section style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '14px 20px', margin: '0 0 20px' }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#166534', margin: '0 0 8px' }}>
                Availability inquiries sent to {contactedTranslators.length} of {matchingTranslatorCount} matching interpreter{matchingTranslatorCount !== 1 ? 's' : ''}
              </Text>
              {contactedTranslators.map((t) => (
                <Text key={t.email} style={{ fontSize: 12, color: '#166534', margin: '2px 0' }}>
                  · {t.name} ({t.email})
                </Text>
              ))}
            </Section>
          )}

          {matchingTranslatorCount === 0 && jobType === 'interpretation' && (
            <Section style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '14px 20px', margin: '0 0 20px' }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9a3412', margin: '0 0 4px' }}>
                No matching interpreters found
              </Text>
              <Text style={{ fontSize: 13, color: '#7c2d12', margin: 0 }}>
                No active interpreters were found for this language pair and requirements. You may need to manually reach out or add interpreters.
              </Text>
            </Section>
          )}

          <Hr style={{ margin: '24px 0', borderColor: '#eee' }} />
          <Text style={{ color: '#888', fontSize: 13 }}>
            <a href={adminPortalUrl} style={{ color: '#1a1a2e' }}>Open Admin Portal</a>
            {' · '}L.A. Translation &amp; Interpretation — Internal Notification
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
