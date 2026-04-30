import Anthropic from '@anthropic-ai/sdk'

export async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.toLowerCase().split('.').pop()

  if (ext === 'docx' || ext === 'doc') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  if (ext === 'pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>
    const data = await pdfParse(buffer)
    return data.text
  }

  return buffer.toString('utf-8')
}

export async function extractWordCount(buffer: Buffer, filename: string): Promise<number> {
  const text = await extractText(buffer, filename)
  return countWords(text)
}

/**
 * Extracts word count with a Claude vision fallback for scanned PDFs and images.
 * Falls back gracefully — never throws, returns 0 if all methods fail.
 */
export async function extractWordCountWithFallback(buffer: Buffer, filename: string): Promise<number> {
  // 1. Try standard text extraction first (fast, free)
  try {
    const count = await extractWordCount(buffer, filename)
    if (count > 20) return count  // trust it if we got something meaningful
  } catch {
    // fall through to Claude
  }

  // 2. Fallback: Claude vision for scanned PDFs / image files
  return extractWordCountViaClaude(buffer, filename).catch(() => 0)
}

async function extractWordCountViaClaude(buffer: Buffer, filename: string): Promise<number> {
  const ext = filename.toLowerCase().split('.').pop() ?? ''
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return 0

  const SUPPORTED: Record<string, 'application/pdf' | 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
  }
  const mediaType = SUPPORTED[ext]
  if (!mediaType) return 0

  // PDFs larger than ~4 MB risk hitting token limits — cap at 4 MB
  if (buffer.byteLength > 4 * 1024 * 1024) return 0

  const client = new Anthropic({ apiKey })
  const base64 = buffer.toString('base64')

  const contentBlock: Anthropic.MessageParam['content'] = mediaType === 'application/pdf'
    ? [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } } as any,
        { type: 'text', text: 'Count the total number of words in this document. Reply with ONLY an integer — no other text.' },
      ]
    : [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text', text: 'Count the total number of words visible in this image. Reply with ONLY an integer — no other text.' },
      ]

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 16,
    messages: [{ role: 'user', content: contentBlock }],
  })

  const raw = (response.content[0] as Anthropic.TextBlock).text?.trim() ?? ''
  const count = parseInt(raw.replace(/[^0-9]/g, ''), 10)
  return isNaN(count) ? 0 : count
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
}
