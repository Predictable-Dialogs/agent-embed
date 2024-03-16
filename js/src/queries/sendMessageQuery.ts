import { getApiEndPoint } from '@/utils/getApiEndPoint'
import type { ChatReply, SendMessageInput } from '@/schemas'
import { isNotEmpty, sendRequest } from '@/lib/utils'

export const sendMessageQuery = ({
  apiHost,
  ...body
}: SendMessageInput & { apiHost?: string }) =>
  sendRequest<ChatReply>({
    method: 'POST',
    // url: `${isNotEmpty(apiHost) ? apiHost : getApiEndPoint()}/api/v1/sendMessage`,
    url: `${isNotEmpty(apiHost) ? apiHost : getApiEndPoint()}`,
    body,
  })
