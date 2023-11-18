import { guessApiHost } from '@/utils/guessApiHost'
import type { ChatReply, SendMessageInput } from '@/schemas'
import { isNotEmpty, sendRequest } from '@/lib/utils'

export const sendMessageQuery = ({
  apiHost,
  ...body
}: SendMessageInput & { apiHost?: string }) =>
  sendRequest<ChatReply>({
    method: 'POST',
    // url: `${isNotEmpty(apiHost) ? apiHost : guessApiHost()}/api/v1/sendMessage`,
    url: `${isNotEmpty(apiHost) ? apiHost : guessApiHost()}`,
    body,
  })
