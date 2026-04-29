import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
})

const ALLOWED_TYPES = new Set([
  // Audio
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave',
  'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/ogg',
  'audio/flac', 'audio/x-flac', 'audio/webm',
  // Video
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
  'video/webm', 'video/mpeg', 'video/3gpp', 'video/ogg',
])

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 422 })

  const { filename, contentType } = parsed.data

  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'File type not supported. Please upload an audio or video file.' }, { status: 422 })
  }

  const jobId = crypto.randomUUID()
  const ext = filename.split('.').pop() ?? 'bin'
  const storagePath = `media/transcription/${jobId}/${filename}`

  const service = createServiceClient()
  const { data, error } = await service.storage
    .from('job-documents')
    .createSignedUploadUrl(storagePath)

  if (error || !data) {
    console.error('[transcription/upload-url]', error)
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    storagePath,
    jobId,
  })
}
