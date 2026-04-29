import {
  Html, Head, Body, Container, Heading, Text, Button, Hr, Section,
} from '@react-email/components'

interface Props {
  translatorName: string
  sourceLang?: string
  targetLang?: string
  wordCount?: number
  deadlineAt?: string
  jobPortalUrl: string
  originalDocUrl: string
  aiDraftUrl?: string
  invoiceNumber?: string
}

export function TranslatorAssignedEmail({
  translatorName,
  sourceLang,
  targetLang,
  wordCount,
  deadlineAt,
  jobPortalUrl,
  originalDocUrl,
  aiDraftUrl,
  invoiceNumber,
}: Props) {
  const langLabel = sourceLang && targetLang ? `${sourceLang} → ${targetLang}` : 'Translation'

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', margin: 0 }}>
        <Container style={{ maxWidth: 600, margin: '40px auto', backgroundColor: '#ffffff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#1a1a2e', fontSize: 22, marginBottom: 8 }}>
            New Job Assigned — {langLabel}
          </Heading>
          <Text style={{ color: '#444', fontSize: 15 }}>
            Hi {translatorName},
          </Text>
          <Text style={{ color: '#444', fontSize: 15 }}>
            A new translation job has been assigned to you. Please review the details and documents below.
          </Text>

          <Section style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: '16px 24px', margin: '20px 0' }}>
            {invoiceNumber && (
              <Text style={{ fontSize: 14, color: '#555', margin: '4px 0' }}>
                Reference: <strong>{invoiceNumber}</strong>
              </Text>
            )}
            <Text style={{ fontSize: 14, color: '#555', margin: '4px 0' }}>
              Languages: <strong>{langLabel}</strong>
            </Text>
            {wordCount && (
              <Text style={{ fontSize: 14, color: '#555', margin: '4px 0' }}>
                Word count: <strong>{wordCount.toLocaleString()} words</strong>
              </Text>
            )}
            {deadlineAt && (
              <Text style={{ fontSize: 14, color: '#c05000', margin: '4px 0', fontWeight: 'bold' }}>
                Deadline: {new Date(deadlineAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            )}
          </Section>

          <Button
            href={originalDocUrl}
            style={{ backgroundColor: '#1a1a2e', color: '#fff', padding: '10px 22px', borderRadius: 6, fontSize: 14, textDecoration: 'none', display: 'inline-block', marginRight: 10 }}
          >
            Download Original Document
          </Button>

          {aiDraftUrl && (
            <Button
              href={aiDraftUrl}
              style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '10px 22px', borderRadius: 6, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}
            >
              Download AI Draft
            </Button>
          )}

          <Text style={{ color: '#555', fontSize: 14, marginTop: 24 }}>
            When your translation is complete, log in to your vendor portal to upload the finished file and submit your invoice.
          </Text>

          <Button
            href={jobPortalUrl}
            style={{ backgroundColor: '#f3f4f6', color: '#1a1a2e', border: '1px solid #d1d5db', padding: '10px 22px', borderRadius: 6, fontSize: 14, textDecoration: 'none', display: 'inline-block', marginTop: 8 }}
          >
            Open Vendor Portal
          </Button>

          <Hr style={{ margin: '32px 0', borderColor: '#eee' }} />
          <Text style={{ color: '#888', fontSize: 12 }}>
            Questions? Contact your coordinator at (213) 385-7781 or info@latranslation.com
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
