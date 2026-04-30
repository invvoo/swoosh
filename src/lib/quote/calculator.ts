export type QuoteBreakdown = {
  wordCount: number
  perWordRate: number
  specialty: string
  multiplier: number
  subtotal: number
  calculatedAmount: number
  minimumApplied: boolean
  finalAmount: number
}

export function calculateQuote(
  wordCount: number,
  perWordRate: number,
  multiplier: number,
  specialty: string,
  minimum = 0
): QuoteBreakdown {
  const subtotal = Math.round(wordCount * perWordRate * 100) / 100
  const calculatedAmount = Math.ceil(subtotal * multiplier * 100) / 100
  const minimumApplied = calculatedAmount < minimum
  const finalAmount = minimumApplied ? minimum : calculatedAmount

  return { wordCount, perWordRate, specialty, multiplier, subtotal, calculatedAmount, minimumApplied, finalAmount }
}

export const CERTIFIED_SPECIALTY_NAME = 'Certified (USCIS)'

/** Words translatable per business day by certification type */
export const WORDS_PER_DAY: Record<string, number> = {
  court: 2000,
  general: 3500,
  none: 5000,
}

/** Calculate standard turnaround in business days */
export function calcTurnaroundDays(wordCount: number, certType: 'court' | 'general' | 'none'): number {
  const wpd = WORDS_PER_DAY[certType] ?? 5000
  return Math.max(1, Math.ceil(wordCount / wpd))
}

export type RushResult = {
  rushDays: number
  rushFeePercent: number
  rushAmount: number
  totalAmount: number
}

/**
 * Calculate rush fee given a base amount and number of days being rushed.
 * Each day rushed adds 20%.
 */
export function calculateRushFee(baseAmount: number, rushDays: number): RushResult {
  const clampedDays = Math.max(0, rushDays)
  const rushFeePercent = clampedDays * 20
  const rushAmount = Math.ceil(baseAmount * (rushFeePercent / 100) * 100) / 100
  const totalAmount = Math.ceil((baseAmount + rushAmount) * 100) / 100
  return { rushDays: clampedDays, rushFeePercent, rushAmount, totalAmount }
}

// ── Review & Certify pricing ──────────────────────────────────────────────────

export type ReviewCertType = 'company' | 'court'

export const REVIEW_RATE: Record<ReviewCertType, number> = {
  company: 0.08,
  court: 0.15,
}

export const REVIEW_MINIMUM: Record<ReviewCertType, number> = {
  company: 50,
  court: 200,
}

/** Standard review capacity: 8,000 words per business day */
export const REVIEW_WORDS_PER_DAY = 8000

export function calculateReviewQuote(
  wordCount: number,
  certType: ReviewCertType
): { amount: number; minimumApplied: boolean; turnaroundDays: number } {
  const rate = REVIEW_RATE[certType]
  const minimum = REVIEW_MINIMUM[certType]
  const calculated = Math.ceil(wordCount * rate * 100) / 100
  const minimumApplied = calculated < minimum
  const amount = minimumApplied ? minimum : calculated
  const turnaroundDays = Math.max(1, Math.ceil(wordCount / REVIEW_WORDS_PER_DAY))
  return { amount, minimumApplied, turnaroundDays }
}

