import { InitialChatReply } from '@/types';
import { getApiEndPoint } from '@/utils/getApiEndPoint';
import type { SendMessageInput, StartParams } from '@/schemas';
import { isNotDefined, isNotEmpty, sendRequest } from '@/lib/utils';
import { getPassThroughAuthToken, type GetAuthToken } from '@/utils/getPassThroughAuthToken';

export async function getInitialChatReplyQuery({
  sessionId,
  agentName,
  initialPrompt,
  isPreview,
  apiHost,
  contextVariables,
  getAuthToken,
}: StartParams & {
  apiHost?: string;
  agentName: string;
  sessionId: string | undefined;
  initialPrompt?: string;
  getAuthToken?: GetAuthToken;
}) {
  if (isNotDefined(agentName)) throw new Error('Agent name is required to get initial messages');

  const passThroughAuthToken = await getPassThroughAuthToken(getAuthToken);
  const { data, error } = await sendRequest<InitialChatReply>({
    method: 'POST',
    url: `${isNotEmpty(apiHost) ? apiHost : getApiEndPoint()}`,
    body: {
      startParams: {
        agentName,
        isPreview,
        contextVariables,
        isStreamEnabled: true,
      },
      agentName,
      sessionId,
      ...(isNotEmpty(initialPrompt) ? { message: initialPrompt } : {}),
      ...(isNotEmpty(passThroughAuthToken) ? { passThroughAuthToken } : {}),
    } satisfies SendMessageInput,
  });

  return {
    data,
    error,
  };
}
