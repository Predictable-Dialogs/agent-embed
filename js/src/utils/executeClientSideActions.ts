import { executeGoogleAnalyticsBlock } from '@/features/blocks/integrations/googleAnalytics/utils/executeGoogleAnalytics';
import { executeRedirect } from '@/features/blocks/logic/redirect';
import { executeSetVariable } from '@/features/blocks/logic/setVariable/executeSetVariable';
import { executePixel } from '@/features/blocks/integrations/pixel/executePixel';
import { ClientSideActionContext } from '@/types';
import type { ChatReply, ReplyLog } from '@/schemas';
import { injectStartProps } from './injectStartProps';

type Props = {
  clientSideAction: NonNullable<ChatReply['clientSideActions']>[0];
  context: ClientSideActionContext;
  onMessageStream?: (chunk: string, message: string) => void;
  setIsConnecting?: (state: boolean) => void;
};

export const executeClientSideAction = async ({
  clientSideAction,
  context,
  setIsConnecting,
}: Props): Promise<
  { blockedPopupUrl: string } | { replyToSend: string | undefined; logs?: ReplyLog[] } | void
> => {
  if ('googleAnalytics' in clientSideAction) {
    return executeGoogleAnalyticsBlock(clientSideAction.googleAnalytics);
  }
  if ('redirect' in clientSideAction) {
    return executeRedirect(clientSideAction.redirect);
  }
  if ('setVariable' in clientSideAction) {
    return executeSetVariable(clientSideAction.setVariable.scriptToExecute);
  }
  if ('startPropsToInject' in clientSideAction) {
    return injectStartProps(clientSideAction.startPropsToInject);
  }
  if ('pixel' in clientSideAction) {
    return executePixel(clientSideAction.pixel);
  }
};
