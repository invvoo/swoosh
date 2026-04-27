export type QuoteBreakdown = {
  wordCount: number
  perWordRate: number
  specialty: string
  multiplier: number
  subtotal: number
  finalAmount: number
}

export function calculateQuote(
  wordCount: number,
  perWordRate: number,
  multiplier: number,
  specialty: string
): QuoteBreakdown {
  const subtotal = wordCount * perWordRate
  const finalAmount = Math.ceil(subtotal * multiplier * 100) / 100

  return {
    wordCount,
    perWordRate,
    specialty,
    multiplier,
    subtotal: Math.round(subtotal * 100) / 100,
    finalAmount,
  }
}
