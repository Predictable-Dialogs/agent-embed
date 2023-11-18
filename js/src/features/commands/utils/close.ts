import { CommandData } from '../types'

export const close = () => {
  const message: CommandData = {
    isFromAgent: true,
    command: 'close',
  }
  window.postMessage(message)
}
