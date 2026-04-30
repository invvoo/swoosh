import { NextRequest, NextResponse } from 'next/server'
import { detectLanguage } from '@/lib/ai/detect-language'
import { extractWordCountWithFallback } from '@/lib/pdf/word-counter'

export const maxDuration = 60 // allow Claude fallback time to complete

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('document') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 422 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = file.name.toLowerCase()
    const ext = filename.split('.').pop() ?? ''

    // Extract text — isolated try/catch so a pdf-parse crash doesn't abort word count
    let text = ''
    try {
      if (ext === 'docx' || ext === 'doc') {
        const mammoth = await import('mammoth')
        const { value } = await mammoth.extractRawText({ buffer })
        text = value
      } else if (ext === 'pdf') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
        const { text: pdfText } = await pdfParse(buffer)
        text = pdfText
      } else if (ext === 'txt') {
        text = buffer.toString('utf-8')
      } else {
        text = buffer.toString('utf-8').slice(0, 800)
      }
    } catch (e) {
      console.warn(`[detect] text extraction failed for "${file.name}" — will use Claude for word count:`, e)
    }

    const textWordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length
    console.log(`[detect] text extraction got ${textWordCount} words from "${file.name}"`)

    // Always run language detection and word count in parallel.
    // If text extraction failed/returned too little, Claude handles word count.
    const wordCountPromise: Promise<number> = textWordCount > 20
      ? Promise.resolve(textWordCount)
      : (console.log(`[detect] falling back to Claude for word count on "${file.name}"`),
         extractWordCountWithFallback(buffer, file.name).catch(() => 0))

    const [{ language, confidence }, wordCount] = await Promise.all([
      detectLanguage(text).catch(() => ({ language: 'Unknown', confidence: 0 })),
      wordCountPromise,
    ])

    console.log(`[detect] result for "${file.name}": lang=${language} conf=${confidence} words=${wordCount}`)
    return NextResponse.json({ language, confidence, wordCount })
  } catch (e) {
    console.error('[detect] unexpected error:', e)
    return NextResponse.json({ language: 'Unknown', confidence: 0, wordCount: 0 })
  }
}
