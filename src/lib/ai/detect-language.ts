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
          content: `Detect the language of the following text. Use these exact names for Chinese variants: "Chinese (Simplified)" for Mandarin/Simplified, "Chinese (Traditional)" for Traditional Chinese, "Cantonese" for Cantonese. For Persian/Farsi use "Persian (Farsi)". Respond with ONLY a JSON object: {"language": "English", "confidence": 0.99}\n\nText:\n${excerpt}`,
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
    const rawLang = typeof parsed.language === 'string' && parsed.language ? parsed.language : 'Unknown'
    const language = normalizeLanguageName(rawLang)
    const rawConf = typeof parsed.confidence === 'number' ? parsed.confidence : 0
    const confidence = Math.min(1, Math.max(0, rawConf))

    return { language, confidence }
  } catch {
    return { language: 'Unknown', confidence: 0 }
  }
}

// Maps common AI-returned names to the canonical names used in our language_pairs table.
const LANG_ALIASES: Record<string, string> = {
  'chinese': 'Chinese (Simplified)',
  'chinese simplified': 'Chinese (Simplified)',
  'mandarin': 'Chinese (Simplified)',
  'mandarin chinese': 'Chinese (Simplified)',
  'simplified chinese': 'Chinese (Simplified)',
  'chinese traditional': 'Chinese (Traditional)',
  'traditional chinese': 'Chinese (Traditional)',
  'cantonese chinese': 'Cantonese',
  'farsi': 'Persian (Farsi)',
  'persian': 'Persian (Farsi)',
  'dari persian': 'Dari',
  'tagalog/filipino': 'Tagalog',
  'filipino': 'Tagalog',
  'malay/indonesian': 'Malay',
  'bahasa indonesia': 'Indonesian',
  'bahasa melayu': 'Malay',
  'haitian creole': 'Haitian Creole',
  'haitian-creole': 'Haitian Creole',
  'creole': 'Haitian Creole',
  'brazilian portuguese': 'Portuguese (Brazilian)',
  'latin american spanish': 'Spanish (Latin American)',
  'castilian': 'Spanish',
  'burmese/myanmar': 'Burmese',
  'myanmar': 'Burmese',
  'khmer/cambodian': 'Khmer',
  'cambodian': 'Khmer',
  'kurdish': 'Kurdish (Kurmanji)',
  'pashto/dari': 'Pashto',
  'flemish': 'Flemish',
}

function normalizeLanguageName(name: string): string {
  const lower = name.toLowerCase().trim()
  return LANG_ALIASES[lower] ?? name
}
