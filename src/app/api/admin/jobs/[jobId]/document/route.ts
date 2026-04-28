import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface Props { params: Promise<{ jobId: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { jobId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: job } = await service
    .from('jobs')
    .select('document_path, document_name')
    .eq('id', jobId)
    .single()

  if (!job?.document_path) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const { data: signedUrl, error } = await service.storage
    .from('job-documents')
    .createSignedUrl(job.document_path, 300) // 5-minute link

  if (error || !signedUrl) {
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
  }

  // Redirect to the signed URL so clicking "View Document" opens it directly
  return NextResponse.redirect(signedUrl.signedUrl)
}
