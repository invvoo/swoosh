import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Step = { label: string; description: string }

const TRANSLATION_STEPS: Step[] = [
  { label: 'Request Received', description: 'Your document has been submitted' },
  { label: 'Quote Ready', description: 'Your quote is ready to review' },
  { label: 'Payment Confirmed', description: 'Payment received — thank you!' },
  { label: 'Translation in Progress', description: 'Our team is working on your document' },
  { label: 'Delivered', description: 'Your translated document is ready' },
]

const INTERPRETATION_STEPS: Step[] = [
  { label: 'Request Received', description: 'Your request has been submitted' },
  { label: 'Confirmed', description: 'Your appointment is confirmed' },
  { label: 'Interpreter Assigned', description: 'An interpreter has been assigned' },
  { label: 'Completed', description: 'Your interpretation session is complete' },
]

const EQUIPMENT_STEPS: Step[] = [
  { label: 'Request Received', description: 'Your rental request has been submitted' },
  { label: 'Quote Ready', description: 'Your quote is ready to review' },
  { label: 'Payment Confirmed', description: 'Payment received — thank you!' },
  { label: 'Equipment Dispatched', description: 'Equipment is on its way' },
  { label: 'Returned', description: 'Equipment has been returned' },
]

const NOTARY_STEPS: Step[] = [
  { label: 'Request Received', description: 'Your request has been submitted' },
  { label: 'Quote Ready', description: 'Your quote is ready to review' },
  { label: 'Payment Confirmed', description: 'Payment received — thank you!' },
  { label: 'Scheduled', description: 'Your appointment is scheduled' },
  { label: 'Completed', description: 'Your documents are ready' },
]

function getSteps(jobType: string): Step[] {
  switch (jobType) {
    case 'translation': return TRANSLATION_STEPS
    case 'interpretation': return INTERPRETATION_STEPS
    case 'equipment_rental': return EQUIPMENT_STEPS
    case 'notary': return NOTARY_STEPS
    default: return TRANSLATION_STEPS
  }
}

function getActiveStep(jobType: string, status: string): number {
  const statusMap: Record<string, Record<string, number>> = {
    translation: {
      draft: 0, quote_sent: 1, quote_accepted: 1, paid: 2,
      ai_translating: 3, ai_review_pending: 3, ai_failed: 3,
      assigned: 3, in_progress: 3, delivered: 4, complete: 4,
    },
    interpretation: {
      draft: 0, confirmed: 1, assigned: 2, completed: 3, invoiced: 3, paid: 3,
    },
    equipment_rental: {
      draft: 0, quote_sent: 1, quote_accepted: 1, paid: 2,
      dispatched: 3, returned: 4, deposit_settled: 4, complete: 4,
    },
    notary: {
      draft: 0, quote_sent: 1, quote_accepted: 1, paid: 2,
      scheduled: 3, completed: 4, complete: 4,
    },
  }
  return statusMap[jobType]?.[status] ?? 0
}

interface Props {
  jobType: string
  status: string
}

export function JobProgressBar({ jobType, status }: Props) {
  const steps = getSteps(jobType)
  const activeStep = getActiveStep(jobType, status)
  const isProcessing = ['ai_translating', 'in_progress', 'assigned'].includes(status)

  return (
    <div className="w-full">
      <div className="flex items-start justify-between relative">
        {/* Connector line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" style={{ zIndex: 0 }}>
          <div
            className="h-full bg-[#1a1a2e] transition-all duration-700"
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, i) => {
          const done = i < activeStep
          const current = i === activeStep
          const future = i > activeStep

          return (
            <div key={step.label} className="flex flex-col items-center flex-1 relative z-10">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                done && 'bg-[#1a1a2e] border-[#1a1a2e]',
                current && 'bg-white border-[#1a1a2e]',
                future && 'bg-white border-gray-300',
              )}>
                {done && <CheckCircle2 className="h-4 w-4 text-white" />}
                {current && isProcessing && i === activeStep && (
                  <Loader2 className="h-4 w-4 text-[#1a1a2e] animate-spin" />
                )}
                {current && !isProcessing && <Circle className="h-3 w-3 text-[#1a1a2e] fill-[#1a1a2e]" />}
                {future && <Circle className="h-3 w-3 text-gray-300" />}
              </div>
              <div className="mt-2 text-center hidden sm:block">
                <p className={cn('text-xs font-medium', current ? 'text-[#1a1a2e]' : done ? 'text-gray-600' : 'text-gray-400')}>
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Current step description — mobile-friendly */}
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-[#1a1a2e]">{steps[activeStep]?.label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{steps[activeStep]?.description}</p>
      </div>
    </div>
  )
}
