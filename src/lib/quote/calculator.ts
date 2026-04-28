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
