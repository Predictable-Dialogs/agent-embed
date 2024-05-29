// streamChat.ts
import { ClientSideActionContext } from '@/types'
import { getApiEndPoint } from '@/utils/getApiEndPoint'
import { isNotEmpty } from '@/lib/utils'

export let reader: ReadableStreamDefaultReader | null;
export let abortController : AbortController | null = null;
const secondsToWaitBeforeRetries = 3;
const secondsToWaitForRetryOnFail = 3;
const maxRetryAttempts = 3

export const streamChat =
  (context: ClientSideActionContext & { retryAttempt?: number }) =>
  async (
    message: string | undefined,
    onMessageStream : ((chunk: string, message: string) => void) | undefined,
    setIsConnecting : ((state: boolean) => void) | undefined
  ): Promise<{ message?: string; error?: object }> => {
    if (!abortController) {
      abortController = new AbortController();
    } 
    try {
      const apiHost = context.apiHost
      setIsConnecting?.(true);
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
        setIsConnecting?.(true);
        if ((context.retryAttempt ?? 0) < maxRetryAttempts &&
            (res.status === 403 || res.status === 500 || res.status === 503)) {
          await new Promise((resolve) => setTimeout(resolve, secondsToWaitBeforeRetries * 1000));
          return streamChat({
            ...context,
            retryAttempt: (context.retryAttempt ?? 0) + 1,
          })(message, onMessageStream, setIsConnecting );
        }
        setIsConnecting?.(false);
        return {
          error: (await res.json()) || 'Failed to fetch the chat response.',
        }
      }

      if (!res.body) {
        throw new Error('The response body is empty.')
      }

      let accumulatedMessage = '';
      if (!reader) {
        reader = res.body.getReader();
      } else {
        // stream exists, so no need any further setup.
        return { message: undefined }
      }
  

      const decoder = new TextDecoder()

      // eslint-disable-next-line no-constant-condition
      while (true) {
        let done, value;
        try {
          const result =  await reader.read();
          done = result.done;
          value = result. value; 
        } catch (error) {
          console.log('stream reset');
          if (reader) {
            try {
              reader.cancel();
            } catch (readerError) {
              console.error(`Error when cancelling the reader: ${readerError}`);
            }
            reader = null;  // Reset reader
          }  

          if (abortController) {
            try {
              abortController.abort();
            } catch (abortError) {
              console.error(`Error with abortController: ${abortError}`);
            }
            abortController = null; 
          }
          break; 
        }

        if (done) {
          break
        }
        const chunk = decoder.decode(value)
        // message += chunk
        setIsConnecting?.(false);
        if (onMessageStream) onMessageStream(chunk, accumulatedMessage)
        if (abortController === null) {
          console.log(`abortController is null, end stream.`)
          reader.cancel()
          break
        }
      }
      return { message: undefined }
    } catch (err) {
      console.log('connection reset');
      if (reader) {
        try {
          reader.cancel();
        } catch (readerError) {
          console.error(`Error when cancelling the reader: ${readerError}`);
        }
        reader = null;  // Reset reader
      }  
    
      if (abortController) {
        try {
          abortController.abort();
        } catch (abortError) {
          console.error(`Error with abortController: ${abortError}`);
        }
        abortController = null; 
      }
    
      setIsConnecting?.(true);
      console.log(`retryAttempt: ${context.retryAttempt}`);
      if ((context.retryAttempt ?? 0) < maxRetryAttempts) {
        await new Promise((resolve) => setTimeout(resolve, secondsToWaitForRetryOnFail * 1000));
        return await streamChat({
          ...context,
          retryAttempt: (context.retryAttempt ?? 0) + 1,
        })(message, onMessageStream, setIsConnecting );
      }
      setIsConnecting?.(false);

      if ((err as any).name === 'AbortError') {
        abortController = null
        return { error: { message: 'Request aborted' } }
      }

      if (err instanceof Error) return { error: { message: err.message } }

      return { error: { message: 'Failed to fetch the chat response.' } }
    }
  }
