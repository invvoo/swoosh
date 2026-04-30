'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AiTranslateButton } from '@/components/admin/ai-translate-button'
import { Sparkles, UserPlus, Send, Eye, CheckCircle2, RefreshCw } from 'lucide-react'

interface Props {
  jobId: string
  status: string
  hasDocument: boolean
  hasAiDraft: boolean
  hasVendorSubmission: boolean
}

export function TranslationWorkflowActions({ jobId, status, hasDocument, hasAiDraft, hasVendorSubmission }: Props) {
  // Primary CTA per status
  if (status === 'draft') {
    return (
      <Link href={`/admin/jobs/${jobId}/quote`}>
        <Button size="sm" className="bg-[#1a1a2e] hover:bg-[#2a2a4e]">
          <Send className="h-3.5 w-3.5 mr-1.5" /> Review &amp; Send Quote
        </Button>
      </Link>
    )
  }

  if (status === 'quote_sent') {
    return (
      <Link href={`/admin/jobs/${jobId}/quote`}>
        <Button size="sm" variant="outline">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Resend / Edit Quote
        </Button>
      </Link>
    )
  }

  if (status === 'quote_accepted') {
    return (
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
        Awaiting client payment
      </div>
    )
  }

  if (status === 'paid' || status === 'ai_failed') {
    return (
      <div className="flex flex-wrap gap-2">
        <Link href={`/admin/jobs/${jobId}/assign`}>
          <Button size="sm" className="bg-[#1a1a2e] hover:bg-[#2a2a4e]">
            <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Assign Translator
          </Button>
        </Link>
        {hasDocument && status !== 'ai_failed' && <AiTranslateButton jobId={jobId} />}
        {status === 'ai_failed' && hasDocument && <AiTranslateButton jobId={jobId} />}
      </div>
    )
  }

  if (status === 'ai_translating') {
    return (
      <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-sm text-purple-800">
        <Sparkles className="h-4 w-4 animate-pulse" /> AI translation in progress…
      </div>
    )
  }

  if (status === 'ai_review_pending') {
    return (
      <div className="flex flex-wrap gap-2">
        <Link href={`/admin/jobs/${jobId}/assign`}>
          <Button size="sm" className="bg-[#1a1a2e] hover:bg-[#2a2a4e]">
            <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Assign Translator / Reviewer
          </Button>
        </Link>
        {hasAiDraft && (
          <a href={`/api/admin/jobs/${jobId}/document?type=draft`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> View AI Draft
            </Button>
          </a>
        )}
      </div>
    )
  }

  if (status === 'assigned') {
    if (hasVendorSubmission) {
      return (
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/jobs/${jobId}/review`}>
            <Button size="sm" className="bg-green-700 hover:bg-green-800">
              <Eye className="h-3.5 w-3.5 mr-1.5" /> Review Submission
            </Button>
          </Link>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm text-blue-800">
        Translator assigned — awaiting submission
      </div>
    )
  }

  if (status === 'in_progress') {
    if (hasVendorSubmission) {
      return (
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/jobs/${jobId}/review`}>
            <Button size="sm" className="bg-green-700 hover:bg-green-800">
              <Eye className="h-3.5 w-3.5 mr-1.5" /> Review Submission
            </Button>
          </Link>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm text-blue-800">
        Translation in progress — awaiting vendor submission
      </div>
    )
  }

  if (status === 'delivered') {
    return (
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4" /> Delivered to client
        </div>
      </div>
    )
  }

  return null
}
