import { NextRequest, NextResponse } from 'next/server'
import { detectLanguage } from '@/lib/ai/detect-language'
import { extractWordCountWithFallback } from '@/lib/pdf/word-counter'

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

    // Run language detection and word count in parallel
    // Word count uses Claude fallback for scanned PDFs / images
    const [{ language, confidence }, wordCount] = await Promise.all([
      detectLanguage(text),
      extractWordCountWithFallback(buffer, file.name).catch(() => 0),
    ])

    return NextResponse.json({ language, confidence, wordCount })
  } catch {
    return NextResponse.json({ language: 'Unknown', confidence: 0, wordCount: 0 })
  }
}
