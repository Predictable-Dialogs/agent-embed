// features/commands/utils/open.ts
import { CommandData } from '../types'

export const open = (options?: { prompt?: string, variables?: Record<string, string | number | boolean> }) => {
  const message: CommandData = {
    isFromAgent: true,
    command: 'open',
    prompt: options?.prompt,
    variables: options?.variables,
  }
  window.postMessage(message)
}
