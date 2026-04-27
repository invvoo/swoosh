import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a professional translator with expertise in certified, legal, medical, technical, and general document translation. When translating:
- Preserve the original document structure and formatting as closely as possible
- Maintain professional terminology appropriate for the subject matter
- Do not add commentary, explanations, or notes — output only the translated text
- Preserve paragraph breaks, numbered lists, and headings
- For proper nouns, names, and addresses: keep them as-is unless there is a standard localized form`

export async function translateDocument(
  text: string,
  sourceLang: string,
  targetLang: string,
  specialty: string
): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Translate the following document from ${sourceLang} to ${targetLang}. This is a ${specialty} document.\n\n<document>\n${text}\n</document>`,
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}
