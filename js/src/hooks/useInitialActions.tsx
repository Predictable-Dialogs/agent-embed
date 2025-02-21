// hooks/useInitialActions.js
import { isNotDefined } from '@/lib/utils';
import { executeClientSideAction } from '@/utils/executeClientSideActions'
import { ChatChunk as ChatChunkType, BotContext } from '@/types';

type UseInitialActionsProps = {
  chatChunks: () => ChatChunkType[];
  context: BotContext;
  setIsConnecting: SetState<boolean>,
  setBlockedPopupUrl: SetState<string | undefined>
};

type SetState<T> = (value: T | ((prev: T) => T)) => void;

export function useInitialActions(
  props: UseInitialActionsProps,
) {
  return async () => {
    const initialChunk = props.chatChunks()[0];
    if (!initialChunk.clientSideActions) return;

    const actionsBeforeFirstBubble = initialChunk.clientSideActions.filter(
      (action) => isNotDefined(action.lastBubbleBlockId)
    );

    for (const action of actionsBeforeFirstBubble) {
      if ('streamOpenAiChatCompletion' in action || 'webhookToExecute' in action) {
        const response = await executeClientSideAction({
          clientSideAction: action,
          context: props.context,
          setIsConnecting: props.setIsConnecting
        });

        if (response && 'replyToSend' in response) return;
        if (response && 'blockedPopupUrl' in response) props.setBlockedPopupUrl(response.blockedPopupUrl);
      }
    }
  };
}