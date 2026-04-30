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

    let text: string

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

    // Count words from the already-extracted text (avoids running pdf-parse twice).
    // For scanned PDFs the text will be near-empty — fall back to Claude vision.
    const textWordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length
    console.log(`[detect] text extraction got ${textWordCount} words from "${file.name}"`)

    // Run language detection and (if needed) Claude word count in parallel
    const wordCountPromise: Promise<number> = textWordCount > 20
      ? Promise.resolve(textWordCount)
      : (console.log(`[detect] count too low (${textWordCount}), falling back to Claude for "${file.name}"`),
         extractWordCountWithFallback(buffer, file.name).catch(() => 0))

    const [{ language, confidence }, wordCount] = await Promise.all([
      detectLanguage(text),
      wordCountPromise,
    ])

    console.log(`[detect] result for "${file.name}": lang=${language} conf=${confidence} words=${wordCount}`)
    return NextResponse.json({ language, confidence, wordCount })
  } catch (e) {
    console.error('[detect] error:', e)
    return NextResponse.json({ language: 'Unknown', confidence: 0, wordCount: 0 })
  }
}
