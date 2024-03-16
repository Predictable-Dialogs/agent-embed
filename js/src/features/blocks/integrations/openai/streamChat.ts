import { ClientSideActionContext } from '@/types'
import { getApiEndPoint } from '@/utils/getApiEndPoint'
import { isNotEmpty } from '@/lib/utils'

// let abortController: AbortController | null = null
const secondsToWaitBeforeRetries = 3
const maxRetryAttempts = 3

export const streamChat =
  (context: ClientSideActionContext & { retryAttempt?: number }) =>
  async (
    message: string | undefined,
    // type: string | undefined,
    { onMessageStream }: { onMessageStream?: (chunk: string, message: string) => void }
  ): Promise<{ message?: string; error?: object }> => {
    
    let abortController = new AbortController();
    try {

      const apiHost = context.apiHost
      if (window.localStorage.getItem('NEXT_PUBLIC_DEBUG') === 'true') {
        console.log(`Debug: streamChat. stream url: ${
          isNotEmpty(apiHost) ? apiHost : getApiEndPoint()
        }/streamer`);
      }
    
      const res = await fetch(
        `${
          isNotEmpty(apiHost) ? apiHost : getApiEndPoint()
        }/streamer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: context.sessionId,
            agentName: context.agentName,
            tabNumber: context.tabNumber,
            message,
          }),
          signal: abortController.signal,
        }
      )

      if (!res.ok) {
        console.log(`res not ok. context.retryAttempt is ${context.retryAttempt}, res.status is ${res.status}`);
        if (
          (context.retryAttempt ?? 0) < maxRetryAttempts &&
          (res.status === 403 || res.status === 500 || res.status === 503)
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, secondsToWaitBeforeRetries * 1000)
          )
          return streamChat({
            ...context,
            retryAttempt: (context.retryAttempt ?? 0) + 1,
          })(message, { onMessageStream })
        }
        return {
          error: (await res.json()) || 'Failed to fetch the chat response.',
        }
      }

      if (!res.body) {
        console.log(`res not having body. throwing ...`);
        throw new Error('The response body is empty.')
      }

      let accumulatedMessage = '';
      let endValue;

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        endValue = value;
        if (done) {
          break
        }
        const chunk = decoder.decode(value)
        // message += chunk
        if (onMessageStream) onMessageStream(chunk, accumulatedMessage)
        if (abortController === null) {
          reader.cancel()
          break
        }
      }
      // Should I comment code below as we do not want to abort connections.
      // abortController = null
      return { message: accumulatedMessage }
    } catch (err) {
      console.error(err)
      // Ignore abort errors as they are expected.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((err as any).name === 'AbortError') {
        // abortController = null
        return { error: { message: 'Request aborted' } }
      }

      if (err instanceof Error) return { error: { message: err.message } }

      return { error: { message: 'Failed to fetch the chat response.' } }
    }
  }
