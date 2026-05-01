import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a professional translator with expertise in certified, legal, medical, technical, and general document translation. When translating:
- Preserve the original document structure and formatting as closely as possible
- Maintain professional terminology appropriate for the subject matter
- Do not add commentary, explanations, or notes — output only the translated text
- Preserve paragraph breaks, numbered lists, and headings
- For proper nouns, names, and addresses: keep them as-is unless there is a standard localized form`

export async function translateDocument(
  text: string,
  sourceLang: string,
  targetLang: string,
  specialty: string
): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Translate the following document from ${sourceLang} to ${targetLang}. This is a ${specialty} document.\n\n<document>\n${text}\n</document>`,
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}

/**
 * Translates a document from a raw buffer.
 * For text-extractable files (docx, txt, readable PDFs): extracts text then translates.
 * For scanned/image PDFs: passes the file directly to Claude as a document block
 * so it can read and translate embedded image text in one shot.
 */
export async function translateDocumentBuffer(
  buffer: Buffer,
  filename: string,
  sourceLang: string,
  targetLang: string,
  specialty: string,
): Promise<string> {
  const fname = filename.toLowerCase()

  // ── Try text extraction first ─────────────────────────────────────────────
  let text = ''
  try {
    if (fname.endsWith('.docx') || fname.endsWith('.doc')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (fname.endsWith('.pdf')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
      text = (await pdfParse(buffer)).text
    } else {
      text = buffer.toString('utf-8')
    }
  } catch {
    text = ''
  }

  const wordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length

  // If we got meaningful text, translate it the normal way
  if (wordCount >= 20) {
    return translateDocument(text, sourceLang, targetLang, specialty)
  }

  // ── Scanned / image-embedded PDF: pass buffer directly to Claude ──────────
  if (!fname.endsWith('.pdf')) {
    // For non-PDFs with no extractable text, translate whatever we got (or empty)
    return text ? translateDocument(text, sourceLang, targetLang, specialty) : ''
  }

  // PDFs up to 20 MB can be passed as base64 document blocks
  const MAX_BYTES = 20 * 1024 * 1024
  if (buffer.byteLength > MAX_BYTES) {
    console.warn(`[translate] scanned PDF too large (${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB) — translating empty text`)
    return ''
  }

  console.log(`[translate] scanned PDF detected (${wordCount} words from pdf-parse) — using Claude document vision for "${filename}"`)
  const base64 = buffer.toString('base64')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          } as any,
          {
            type: 'text',
            text: `Read every piece of text visible in this document (including text embedded in images or scanned pages) and translate it from ${sourceLang} to ${targetLang}. This is a ${specialty} document. Output only the translated text — no commentary, no explanations.`,
          },
        ],
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}

