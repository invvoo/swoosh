import { NextRequest, NextResponse } from 'next/server'
import { detectLanguage, detectLanguageAndWordsViaClaude } from '@/lib/ai/detect-language'

export const maxDuration = 120 // allow Claude vision time to complete for large scanned PDFs

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

    // Extract text — isolated try/catch so a pdf-parse crash doesn't abort the request
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
      console.warn(`[detect] text extraction failed for "${file.name}":`, e)
    }

    const textWordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length
    console.log(`[detect] text extraction got ${textWordCount} words from "${file.name}"`)

    // If we have enough text, run text-based detection + word count from text in parallel
    if (textWordCount > 20) {
      const { language, confidence } = await detectLanguage(text).catch(() => ({ language: 'Unknown', confidence: 0 }))
      console.log(`[detect] text-based result: lang=${language} conf=${confidence} words=${textWordCount}`)
      return NextResponse.json({ language, confidence, wordCount: textWordCount })
    }

    // Not enough text (scanned PDF or image) — use Claude vision to detect language AND count words in one call
    console.log(`[detect] text too short, using Claude vision for "${file.name}"`)
    const { language, confidence, wordCount } = await detectLanguageAndWordsViaClaude(buffer, file.name).catch(() => ({
      language: 'Unknown', confidence: 0, wordCount: 0,
    }))

    console.log(`[detect] Claude vision result: lang=${language} conf=${confidence} words=${wordCount}`)
    return NextResponse.json({ language, confidence, wordCount })
  } catch (e) {
    console.error('[detect] unexpected error:', e)
    return NextResponse.json({ language: 'Unknown', confidence: 0, wordCount: 0 })
  }
}
