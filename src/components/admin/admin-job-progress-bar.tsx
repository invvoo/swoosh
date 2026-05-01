import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Step = { label: string; sub?: string }

// ── Translation ──────────────────────────────────────────────────────────────
const TRANSLATION_STEPS: Step[] = [
  { label: 'Received' },
  { label: 'Quote Sent' },
  { label: 'Paid' },
  { label: 'AI Draft', sub: 'ai_review_pending' },
  { label: 'Assigned' },
  { label: 'Delivered' },
  { label: 'Complete' },
]

function translationStep(status: string): number {
  const map: Record<string, number> = {
    draft: 0,
    quote_sent: 1, quote_accepted: 1,
    paid: 2, ai_translating: 2, ai_failed: 2,
    ai_review_pending: 3,
    assigned: 4, in_progress: 4,
    delivered: 5,
    complete: 6,
  }
  return map[status] ?? 0
}

// ── Interpretation ────────────────────────────────────────────────────────────
const INTERPRETATION_STEPS: Step[] = [
  { label: 'Received' },
  { label: 'Quote Sent' },
  { label: 'Paid' },
  { label: 'Assigned' },
  { label: 'Completed' },
  { label: 'Invoiced' },
  { label: 'Complete' },
]

function interpretationStep(status: string): number {
  const map: Record<string, number> = {
    draft: 0,
    confirmed: 1,                        // legacy
    quote_sent: 1, quote_accepted: 1,
    paid: 2,
    assigned: 3,
    completed: 4,
    invoiced: 5,
    complete: 6,
  }
  return map[status] ?? 0
}

// ── Equipment Rental ──────────────────────────────────────────────────────────
const EQUIPMENT_STEPS: Step[] = [
  { label: 'Received' },
  { label: 'Quote Sent' },
  { label: 'Paid' },
  { label: 'Dispatched' },
  { label: 'Returned' },
  { label: 'Complete' },
]

function equipmentStep(status: string): number {
  const map: Record<string, number> = {
    draft: 0,
    quote_sent: 1, quote_accepted: 1,
    paid: 2,
    dispatched: 3,
    returned: 4, deposit_settled: 4,
    complete: 5,
  }
  return map[status] ?? 0
}

// ── Notary ────────────────────────────────────────────────────────────────────
const NOTARY_STEPS: Step[] = [
  { label: 'Received' },
  { label: 'Quote Sent' },
  { label: 'Paid' },
  { label: 'Scheduled' },
  { label: 'Completed' },
  { label: 'Complete' },
]

function notaryStep(status: string): number {
  const map: Record<string, number> = {
    draft: 0,
    quote_sent: 1, quote_accepted: 1,
    paid: 2,
    scheduled: 3,
    completed: 4,
    complete: 5,
  }
  return map[status] ?? 0
}

// ── Active-step spinner statuses ──────────────────────────────────────────────
const PROCESSING_STATUSES = new Set(['ai_translating', 'in_progress'])

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  jobType: string
  status: string
}

export function AdminJobProgressBar({ jobType, status }: Props) {
  let steps: Step[]
  let activeStep: number

  switch (jobType) {
    case 'interpretation':
      steps = INTERPRETATION_STEPS
      activeStep = interpretationStep(status)
      break
    case 'equipment_rental':
      steps = EQUIPMENT_STEPS
      activeStep = equipmentStep(status)
      break
    case 'notary':
      steps = NOTARY_STEPS
      activeStep = notaryStep(status)
      break
    default:
      steps = TRANSLATION_STEPS
      activeStep = translationStep(status)
  }

  const isProcessing = PROCESSING_STATUSES.has(status)

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[420px]">
        <div className="flex items-start justify-between relative">
          {/* Track line */}
          <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-gray-200" style={{ zIndex: 0 }}>
            <div
              className="h-full bg-[#1a1a2e] transition-all duration-500"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((step, i) => {
            const done = i < activeStep
            const current = i === activeStep
            const future = i > activeStep

            return (
              <div key={step.label} className="flex flex-col items-center flex-1 relative z-10 px-1">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white',
                  done && 'bg-[#1a1a2e] border-[#1a1a2e]',
                  current && 'border-[#1a1a2e] bg-white',
                  future && 'border-gray-300 bg-white',
                )}>
                  {done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  {current && isProcessing && <Loader2 className="h-3 w-3 text-[#1a1a2e] animate-spin" />}
                  {current && !isProcessing && <Circle className="h-2.5 w-2.5 text-[#1a1a2e] fill-[#1a1a2e]" />}
                  {future && <Circle className="h-2.5 w-2.5 text-gray-300" />}
                </div>
                <p className={cn(
                  'mt-1.5 text-center text-[10px] font-medium leading-tight',
                  current ? 'text-[#1a1a2e]' : done ? 'text-gray-500' : 'text-gray-300',
                )}>
                  {step.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
