import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface Props { params: Promise<{ jobId: string }> }

export async function GET(req: NextRequest, { params }: Props) {
  const { jobId } = await params
  const type = req.nextUrl.searchParams.get('type') // 'draft' | null (original)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: job } = await service
    .from('jobs')
    .select('document_path, document_name, ai_draft_path')
    .eq('id', jobId)
    .single()

  const filePath = type === 'draft' ? job?.ai_draft_path : job?.document_path
  if (!filePath) {
    return NextResponse.json({ error: type === 'draft' ? 'AI draft not available yet' : 'Document not found' }, { status: 404 })
  }

  const { data: signedUrl, error } = await service.storage
    .from('job-documents')
    .createSignedUrl(filePath, 300) // 5-minute link

  if (error || !signedUrl) {
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
  }

  return NextResponse.redirect(signedUrl.signedUrl)
}
