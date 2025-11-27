import { CommandData } from '../types'

export const setContextVariables = (
  variables: Record<string, string | number | boolean>
) => {
  const message: CommandData = {
    isFromAgent: true,
    command: 'setContextVariables',
    variables,
  }
  window.postMessage(message)
}
