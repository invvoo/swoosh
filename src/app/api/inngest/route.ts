import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { translateJob } from '@/inngest/functions/translate-job'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [translateJob],
})
