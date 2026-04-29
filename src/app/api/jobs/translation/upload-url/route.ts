import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
})

const ALLOWED_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
  'application/pdf',
  'text/plain',
  'application/octet-stream', // fallback for some browsers
])

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 422 })

  const { filename, contentType } = parsed.data
  const ext = filename.toLowerCase().split('.').pop() ?? ''

  const allowedExts = new Set(['docx', 'doc', 'pdf', 'txt'])
  if (!allowedExts.has(ext) && !ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'Only .docx, .doc, .pdf, and .txt files are accepted.' }, { status: 422 })
  }

  const fileId = crypto.randomUUID()

  // Sanitize filename for storage path: strip non-ASCII (CJK, accented, etc.) and
  // replace spaces/specials with hyphens so Supabase Storage accepts the path.
  const safeFilename = filename
    .normalize('NFD')                    // decompose accented chars before stripping
    .replace(/[^\x00-\x7F]/g, '')       // strip non-ASCII
    .replace(/[^a-zA-Z0-9._-]+/g, '-') // collapse spaces/specials to hyphens
    .replace(/^-+|-+$/g, '')            // trim leading/trailing hyphens
    || `file.${ext}`                     // fallback when entire name was non-ASCII

  const storagePath = `documents/raw/pending/${fileId}/${safeFilename}`

  const service = createServiceClient()
  const { data, error } = await service.storage
    .from('job-documents')
    .createSignedUploadUrl(storagePath)

  if (error || !data) {
    console.error('[translation/upload-url]', error)
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
  }

  return NextResponse.json({ signedUrl: data.signedUrl, storagePath })
}
