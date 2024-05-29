import { executeChatwoot } from '@/features/blocks/integrations/chatwoot'
import { executeGoogleAnalyticsBlock } from '@/features/blocks/integrations/googleAnalytics/utils/executeGoogleAnalytics'
import { streamChat } from '@/queries/streamChat'
import { executeRedirect } from '@/features/blocks/logic/redirect'
import { executeScript } from '@/features/blocks/logic/script/executeScript'
import { executeSetVariable } from '@/features/blocks/logic/setVariable/executeSetVariable'
import { executeWait } from '@/features/blocks/logic/wait/utils/executeWait'
import { executePixel } from '@/features/blocks/integrations/pixel/executePixel'
import { ClientSideActionContext } from '@/types'
import type { ChatReply, ReplyLog } from '@/schemas'
import { injectStartProps } from './injectStartProps'

type Props = {
  clientSideAction: NonNullable<ChatReply['clientSideActions']>[0]
  context: ClientSideActionContext
  onMessageStream?: (chunk: string, message: string) => void
  setIsConnecting?: (state: boolean) => void;
}

export const executeClientSideAction = async ({
  clientSideAction,
  context,
  onMessageStream,
  setIsConnecting
}: Props): Promise<
  | { blockedPopupUrl: string }
  | { replyToSend: string | undefined; logs?: ReplyLog[] }
  | void
> => {
  if ('chatwoot' in clientSideAction) {
    return executeChatwoot(clientSideAction.chatwoot)
  }
  if ('googleAnalytics' in clientSideAction) {
    return executeGoogleAnalyticsBlock(clientSideAction.googleAnalytics)
  }
  if ('scriptToExecute' in clientSideAction) {
    return executeScript(clientSideAction.scriptToExecute)
  }
  if ('redirect' in clientSideAction) {
    return executeRedirect(clientSideAction.redirect)
  }
  if ('wait' in clientSideAction) {
    return executeWait(clientSideAction.wait)
  }
  if ('setVariable' in clientSideAction) {
    return executeSetVariable(clientSideAction.setVariable.scriptToExecute)
  }
  if ('streamOpenAiChatCompletion' in clientSideAction) {
      const { error, message } = await streamChat(context)(
        clientSideAction.streamOpenAiChatCompletion.message,
        onMessageStream,
        setIsConnecting
      );

      if (error) {
        return {
          replyToSend: undefined,
          logs: [
            {
              status: 'error',
              description: 'Failed to stream OpenAI completion',
              details: JSON.stringify(error, null, 2),
            },
          ],
        }
      }
      
      return { replyToSend: message }
  }
  if ('startPropsToInject' in clientSideAction) {
    return injectStartProps(clientSideAction.startPropsToInject)
  }
  if ('pixel' in clientSideAction) {
    return executePixel(clientSideAction.pixel)
  }
}
