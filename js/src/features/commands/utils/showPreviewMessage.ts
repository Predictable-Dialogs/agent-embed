import { CommandData, ShowMessageCommandData } from '../types'

export const showPreviewMessage = (
  proactiveMessage?: ShowMessageCommandData['message']
) => {
  const message: CommandData = {
    isFromAgent: true,
    command: 'showPreviewMessage',
    message: proactiveMessage,
  }
  window.postMessage(message)
}
