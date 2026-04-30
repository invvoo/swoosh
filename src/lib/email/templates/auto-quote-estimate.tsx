import {
  Html, Head, Body, Container, Heading, Text, Hr, Section,
} from '@react-email/components'

interface AutoQuoteEstimateEmailProps {
  clientName: string
  jobType: 'translation' | 'interpretation'
  sourceLang?: string
  targetLang?: string
  certificationLabel?: string   // e.g. "No certification", "General/Company", "Court Certified"
  wordCount?: number            // translation only
  estimatedAmount: number       // 0 if pricing is missing
  hasMissingPricing: boolean    // if true, show different message
  unreadableDocument?: boolean  // true when word count could not be extracted from document
  // interpretation specific
  scheduledAt?: string          // formatted date/time string
  durationMinutes?: number
  locationType?: string
}

export function AutoQuoteEstimateEmail({
  clientName,
  jobType,
  sourceLang,
  targetLang,
  certificationLabel,
  wordCount,
  estimatedAmount,
  hasMissingPricing,
  unreadableDocument,
  scheduledAt,
  durationMinutes,
  locationType,
}: AutoQuoteEstimateEmailProps) {
  const isTranslation = jobType === 'translation'
  const headingLabel = isTranslation ? 'Translation' : 'Interpretation'

  const requestDescription = isTranslation
    ? sourceLang && targetLang
      ? `We've received your document for ${sourceLang} → ${targetLang} translation${certificationLabel ? ` (${certificationLabel})` : ''}.`
      : `We've received your translation request${certificationLabel ? ` (${certificationLabel})` : ''}.`
    : `We've received your interpretation request${locationType ? ` (${locationType.replace(/_/g, ' ')})` : ''}.`

  const estimateSubtext = isTranslation
    ? wordCount
      ? `This is an estimate based on ${wordCount.toLocaleString()} words${certificationLabel ? ` · ${certificationLabel}` : ''}. Our team will review and send you a formal quote. Final pricing may be adjusted before you receive it.`
      : `This is an estimate based on your document. Our team will review and send you a formal quote. Final pricing may be adjusted before you receive it.`
    : durationMinutes
      ? `This is an estimate based on a ${durationMinutes}-minute session. Our team will review and send you a formal quote. Final pricing may be adjusted before you receive it.`
      : `This is an estimate based on your session details. Our team will review and send you a formal quote. Final pricing may be adjusted before you receive it.`

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', margin: 0 }}>
        <Container style={{ maxWidth: 600, margin: '40px auto', backgroundColor: '#ffffff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#1a1a2e', fontSize: 24, marginBottom: 8 }}>
            We Received Your {headingLabel} Request
          </Heading>

          <Text style={{ color: '#444', fontSize: 16 }}>
            Dear {clientName},
          </Text>

          <Text style={{ color: '#444', fontSize: 16 }}>
            {requestDescription}
          </Text>

          {/* Interpretation session details */}
          {!isTranslation && (scheduledAt || durationMinutes || locationType) && (
            <Section style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: '16px 24px', margin: '16px 0' }}>
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
                <Text style={{ margin: '0', fontSize: 15 }}>
                  <strong>Format:</strong> {locationType.replace(/_/g, ' ')}
                </Text>
              )}
            </Section>
          )}

          {hasMissingPricing ? (
            <Section style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 8, padding: '16px 24px', margin: '24px 0' }}>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#92400e', margin: '0 0 6px' }}>
                {unreadableDocument ? 'Quote Pending — Document Review Required' : 'Pricing Review Required'}
              </Text>
              <Text style={{ color: '#78350f', fontSize: 14, margin: 0 }}>
                {unreadableDocument
                  ? 'We were unable to automatically read your document to calculate an estimate. Our team will review it manually and send you a formal quote by email shortly.'
                  : 'Our team will need to review your request to determine pricing. We’ll send you a quote by email.'}
              </Text>
            </Section>
          ) : (
            <Section style={{ backgroundColor: '#f0f4ff', borderRadius: 8, padding: '16px 24px', margin: '24px 0' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 6px' }}>
                Estimated Quote: ${estimatedAmount.toFixed(2)}
              </Text>
              <Text style={{ color: '#666', fontSize: 14, margin: 0 }}>
                {estimateSubtext}
              </Text>
            </Section>
          )}

          <Hr style={{ margin: '32px 0', borderColor: '#eee' }} />

          <Text style={{ color: '#888', fontSize: 13 }}>
            Our team typically responds within 2 business hours. Questions? Call (213) 385-7781.
            <br />
            L.A. Translation &amp; Interpretation · 2975 Wilshire Blvd #205, Los Angeles, CA 90010
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
