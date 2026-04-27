export async function extractWordCount(buffer: Buffer, filename: string): Promise<number> {
  const ext = filename.toLowerCase().split('.').pop()

  if (ext === 'docx' || ext === 'doc') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return countWords(result.value)
  }

  if (ext === 'pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>
    const data = await pdfParse(buffer)
    return countWords(data.text)
  }

  if (ext === 'txt') {
    return countWords(buffer.toString('utf-8'))
  }

  // Fallback: treat as plain text
  return countWords(buffer.toString('utf-8'))
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
}
