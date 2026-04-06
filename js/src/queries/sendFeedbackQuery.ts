import { getApiEndPoint } from '@/utils/getApiEndPoint'
import { isNotEmpty, sendRequest } from '@/lib/utils'

export type FeedbackType = 'positive' | 'negative'

export type SendFeedbackInput = {
  agentName: string;
  sessionId: string;
  messageId: string;
  type: FeedbackType;
  correctiveAnswer?: string;
  apiHost?: string;
}

export const sendFeedbackQuery = ({
  apiHost,
  agentName,
  sessionId,
  messageId,
  type,
  correctiveAnswer,
}: SendFeedbackInput) =>
  sendRequest<{ ok: boolean; feedbackStatus?: 'NONE' | 'GREEN' | 'RED' }>({
    method: 'POST',
    url: `${isNotEmpty(apiHost) ? apiHost : getApiEndPoint()}`,
    body: {
      agentName,
      sessionId,
      feedback: {
        messageId,
        type,
        ...(typeof correctiveAnswer === 'string' ? { correctiveAnswer } : {}),
      },
    },
  })
