import { BotContext } from '@/types'

export const setPaymentInProgressInStorage = (state: {
  sessionId: string | null
  agentConfig: BotContext['agentConfig']
}) => {
  sessionStorage.setItem('agentPaymentInProgress', JSON.stringify(state))
}

export const getPaymentInProgressInStorage = () =>
  sessionStorage.getItem('agentPaymentInProgress')

export const removePaymentInProgressFromStorage = () => {
  sessionStorage.removeItem('agentPaymentInProgress')
}
