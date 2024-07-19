// features/commands/utils/open.ts
import { CommandData } from '../types'

export const open = (options?: { initialPrompt?: string, variables?: Record<string, string | number | boolean> }) => {
  const message: CommandData = {
    isFromAgent: true,
    command: 'open',
    initialPrompt: options?.initialPrompt,
    variables: options?.variables,
  }
  window.postMessage(message)
}
