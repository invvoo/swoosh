import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type DetectionResult = {
  language: string   // English name, e.g. "Spanish", "Japanese"
  confidence: number // 0–1
}

export async function detectLanguage(text: string): Promise<DetectionResult> {
  const trimmed = text.trim()

  if (!trimmed || trimmed.length < 10) {
    return { language: 'Unknown', confidence: 0 }
  }

  const excerpt = trimmed.slice(0, 800)

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 64,
      messages: [
        {
          role: 'user',
          content: `Detect the language of the following text. Respond with ONLY a JSON object in this exact format: {"language": "English", "confidence": 0.99}\n\nText:\n${excerpt}`,
        },
      ],
    })

    const block = message.content[0]
    if (block.type !== 'text') {
      return { language: 'Unknown', confidence: 0 }
    }

    const raw = block.text
    const match = raw.match(/\{[^}]+\}/)
    if (!match) {
      return { language: 'Unknown', confidence: 0 }
    }

    const parsed = JSON.parse(match[0]) as { language?: unknown; confidence?: unknown }
    const language = typeof parsed.language === 'string' && parsed.language ? parsed.language : 'Unknown'
    const rawConf = typeof parsed.confidence === 'number' ? parsed.confidence : 0
    const confidence = Math.min(1, Math.max(0, rawConf))

    return { language, confidence }
  } catch {
    return { language: 'Unknown', confidence: 0 }
  }
}
