import { BotContext, InitialChatReply } from '@/types'
import { getApiEndPoint } from '@/utils/getApiEndPoint'
import type { SendMessageInput, StartParams } from '@/schemas'
import { isNotDefined, isNotEmpty, sendRequest } from '@/lib/utils'
import {
  getPaymentInProgressInStorage,
  removePaymentInProgressFromStorage,
} from '@/features/blocks/inputs/payment/helpers/paymentInProgressStorage'

export async function getInitialChatReplyQuery({
  sessionId,
  agentName,
  initialPrompt,
  isPreview,
  apiHost,
  prefilledVariables,
  startGroupId,
  resultId,
  stripeRedirectStatus,
}: StartParams & {
  stripeRedirectStatus?: string
  apiHost?: string
  agentName: string
  sessionId: string | undefined
  initialPrompt?: string
}) {

  if (isNotDefined(agentName))
    throw new Error('Agent name is required to get initial messages')

  const paymentInProgressStateStr = getPaymentInProgressInStorage() ?? undefined
  const paymentInProgressState = paymentInProgressStateStr
    ? (JSON.parse(paymentInProgressStateStr) as {
        sessionId: string
        agentConfig: BotContext['agentConfig']
      })
    : undefined
  if (paymentInProgressState) removePaymentInProgressFromStorage()
  const { data, error } = await sendRequest<InitialChatReply>({
    method: 'POST',
    // url: `${isNotEmpty(apiHost) ? apiHost : getApiEndPoint()}/api/v1/sendMessage`,
    url: `${isNotEmpty(apiHost) ? apiHost : getApiEndPoint()}`,
    body: {
      startParams: paymentInProgressState
        ? undefined
        : {
            agentName,
            isPreview,
            prefilledVariables,
            startGroupId,
            resultId,
            isStreamEnabled: true,
          },
      agentName,
      sessionId,
      message: initialPrompt,
    } satisfies SendMessageInput,
  })

  return {
    data: data
      ? {
          ...data,
          ...(paymentInProgressState
            ? { agentConfig: paymentInProgressState.agentConfig }
            : {}),
        }
      : undefined,
    error,
  }
}
