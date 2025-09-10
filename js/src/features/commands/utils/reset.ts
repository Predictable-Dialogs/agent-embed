import { CommandData } from '../types'

export const reset = () => {
  const message: CommandData = {
    isFromAgent: true,
    command: 'reset',
  }
  window.postMessage(message)
}