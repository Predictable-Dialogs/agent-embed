import { CommandData } from '../types'

export const toggle = () => {
  const message: CommandData = {
    isFromAgent: true,
    command: 'toggle',
  }
  window.postMessage(message)
}
