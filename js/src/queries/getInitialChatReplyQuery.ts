import { InitialChatReply } from '@/types';
import { getApiEndPoint } from '@/utils/getApiEndPoint';
import type { SendMessageInput, StartParams } from '@/schemas';
import { isNotDefined, isNotEmpty, sendRequest } from '@/lib/utils';

export async function getInitialChatReplyQuery({
  sessionId,
  agentName,
  initialPrompt,
  isPreview,
  apiHost,
  prefilledVariables,
  startGroupId,
  resultId,
}: StartParams & {
  apiHost?: string;
  agentName: string;
  sessionId: string | undefined;
  initialPrompt?: string;
}) {
  if (isNotDefined(agentName)) throw new Error('Agent name is required to get initial messages');

  const { data, error } = await sendRequest<InitialChatReply>({
    method: 'POST',
    url: `${isNotEmpty(apiHost) ? apiHost : getApiEndPoint()}`,
    body: {
      startParams: {
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
  });

  return {
    data,
    error,
  };
}
