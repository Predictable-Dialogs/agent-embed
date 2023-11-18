import { CommandData } from '../types'

export const hidePreviewMessage = () => {
  const message: CommandData = {
    isFromAgent: true,
    command: 'hidePreviewMessage',
  }
  window.postMessage(message)
}
