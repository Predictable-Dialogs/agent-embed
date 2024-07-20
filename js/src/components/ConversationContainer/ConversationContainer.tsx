import { ChatReply, SendMessageInput, Theme } from '@/schemas'
import { InputBlockType } from '@/schemas/features/blocks/inputs/enums'
import {
  createEffect,
  createSignal,
  createUniqueId,
  For,
  onMount,
  Show,
  onCleanup,
} from 'solid-js'
import { sendMessageQuery } from '@/queries/sendMessageQuery'
import { ChatChunk } from './ChatChunk'
import {
  BotContext,
  ChatChunk as ChatChunkType,
  InitialChatReply,
  OutgoingLog,
} from '@/types'
import { isNotDefined } from '@/lib/utils'
import { executeClientSideAction } from '@/utils/executeClientSideActions'
import { LoadingChunk, ConnectingChunk } from './LoadingChunk'
import { PopupBlockedToast } from './PopupBlockedToast'
import { setStreamingMessage } from '@/utils/streamingMessageSignal'
import { abortController, reader } from '@/queries/streamChat'
import { useInitialActions } from '@/hooks/useInitialActions';

const parseDynamicTheme = (
  initialTheme: Theme,
  dynamicTheme: ChatReply['dynamicTheme']
): Theme => ({
  ...initialTheme,
  chat: {
    ...initialTheme.chat,
    hostAvatar:
      initialTheme.chat.hostAvatar && dynamicTheme?.hostAvatarUrl
        ? {
            ...initialTheme.chat.hostAvatar,
            url: dynamicTheme.hostAvatarUrl,
          }
        : initialTheme.chat.hostAvatar,
    guestAvatar:
      initialTheme.chat.guestAvatar && dynamicTheme?.guestAvatarUrl
        ? {
            ...initialTheme.chat.guestAvatar,
            url: dynamicTheme?.guestAvatarUrl,
          }
        : initialTheme.chat.guestAvatar,
  },
})

type Props = {
  initialAgentReply: InitialChatReply
  context: BotContext
  onNewInputBlock?: (ids: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
  setSessionId: (id: string | null) => void;
  isConnecting?: boolean;
}

export const ConversationContainer = (props: Props) => {
  let chatContainer: HTMLDivElement | undefined
  const [chatChunks, setChatChunks] = createSignal<ChatChunkType[]>([
    {
      input: props.initialAgentReply.input,
      messages: props.initialAgentReply.messages,
      clientSideActions: props.initialAgentReply.clientSideActions,
    },
  ])
  const [dynamicTheme, setDynamicTheme] = createSignal<
    ChatReply['dynamicTheme']
  >(props.initialAgentReply.dynamicTheme)
  const [theme, setTheme] = createSignal(props.initialAgentReply.agentConfig.theme)
  const [isSending, setIsSending] = createSignal(false)
  const [isConnecting, setIsConnecting] = createSignal(false)
  const [blockedPopupUrl, setBlockedPopupUrl] = createSignal<string>()
  const [hasError, setHasError] = createSignal(false)
  const [activeInputId, setActiveInputId] = createSignal<number>(
    props.initialAgentReply.input ? 1 : 0
  )

  // onMount(() => {
  //   const executeInitialActions = async () => {
  //     const initialChunk = chatChunks()[0];
  //     if (initialChunk.clientSideActions) {
  //       const actionsBeforeFirstBubble = initialChunk.clientSideActions.filter(
  //         (action) => isNotDefined(action.lastBubbleBlockId)
  //       );
  //       for (const action of actionsBeforeFirstBubble) {
  //         if (
  //           'streamOpenAiChatCompletion' in action ||
  //           'webhookToExecute' in action
  //         ) {
  //           const response = await executeClientSideAction({
  //             clientSideAction: action,
  //             context: {
  //               apiHost: props.context.apiHost,
  //               sessionId: props.context.sessionId,
  //               agentName: props.context.agentName,
  //               tabNumber: props.context.tabNumber
  //             },
  //             onMessageStream: streamMessage,
  //             setIsConnecting: setIsConnecting
  //           });
  //           if (response && 'replyToSend' in response) {
  //             return;
  //           }
  //           if (response && 'blockedPopupUrl' in response) {
  //             setBlockedPopupUrl(response.blockedPopupUrl);
  //           }  
  //         }
  //       }
  //     }
  //   };
  
  //   executeInitialActions();  
  // })

  createEffect(() => {
    setTheme(
      parseDynamicTheme(props.initialAgentReply.agentConfig.theme, dynamicTheme())
    )
  })

  /**
   * Process a chunk of data from the server.
   * 
   * This function tries to parse the chunk as JSON and checks for a 'type' property.
   * Depending on the 'type' property, it either returns independent text or appends to the existing message.
   * If the chunk is not JSON or doesn't have a 'type' property, it's treated as a normal text message.
   * 
   * @param {string} chunk - The chunk of data to process.
   * @param {string} message - The existing message string to which new text might be appended.
   * @returns {string} - The updated message string.
   */
  const streamMessage = (chunk: string, content: string) => {
    let parsedChunk: any;
    let isJson = false;

    // Try to parse the chunk as JSON
    try {
      parsedChunk = JSON.parse(chunk);
      isJson = true;
    } catch (e) {
      // Not a JSON, continue as a text message
      console.log(`Failed to parse response`);
      isJson = false;
    }

    if (isJson) {
      if (parsedChunk.end) {
        //Delete the session id
        // props.setSessionId(null);
      } else {
        //Match with the sessionId from the server
        if (parsedChunk.sessionId !== props.context.sessionId) {
          props.setSessionId(parsedChunk.sessionId);
        }
      }

      if (parsedChunk.pdType === 'independentText') {
        // Return the independent text
        streamIndependentMessage(parsedChunk);
      }
    } else {
      // Treat as a normal text message
      content += chunk;
      streamTextMessage(content);
    }
  };

  const streamIndependentMessage = (data: any) => {
    setIsSending(false);
    const lastChunk = [...chatChunks()].pop();
    if (!lastChunk) return;

    if (data.input) {
      setActiveInputId((prev) => prev + 1);
    }

    setChatChunks((displayedChunks) => [
      ...displayedChunks,
      {
        input: data.input,
        messages: [...chatChunks()].pop()?.streamingMessageId ? data.messages.slice(1) : data.messages,
        clientSideActions: data.clientSideActions,
      },
    ]);
  };

  const streamTextMessage = (content: string) => {
    setIsSending(false);
    const lastChunk = [...chatChunks()].pop();
    if (!lastChunk) return;
    const id = lastChunk.streamingMessageId ?? createUniqueId();
    if (!lastChunk.streamingMessageId)
      setChatChunks((displayedChunks) => [
        ...displayedChunks,
        {
          messages: [],
          streamingMessageId: id,
        },
      ]);
    setStreamingMessage({ id, content });
  };

  const executeInitialActions = useInitialActions({
    chatChunks,
    context: props.context,
    onMessageStream: streamMessage,
    setIsConnecting,
    setBlockedPopupUrl,
  });

  onMount(() => {
    executeInitialActions();
  });

  createEffect(() => {
    setTheme(parseDynamicTheme(props.initialAgentReply.agentConfig.theme, dynamicTheme()));
  });

  const sendMessage = async (message: string | undefined, clientLogs?: SendMessageInput['clientLogs']) => {
    if (clientLogs) {
      props.onNewLogs?.(clientLogs);
    }

    setHasError(false);

    const currentInputBlock = [...chatChunks()].pop()?.input;

    if (currentInputBlock?.id && props.onAnswer && message) {
      props.onAnswer({ message, blockId: currentInputBlock.id });
    }

    if (currentInputBlock?.type === InputBlockType.FILE) {
      props.onNewLogs?.([
        {
          description: 'Files are not uploaded in preview mode',
          status: 'info',
        },
      ]);
    }

    // Current chunk is {"input":{"type":"text input","options":{"labels":{"placeholder":"Type your answer...","button":"Send"},"isLong":false}},"messages":[{"type":"text","content":{"richText":[{"type":"p","children":[{"text":"What is your email address?"}]}]}}]}
    // If current chunk type has input->type = 'text input' then stream:
    // if (currentInputBlock?.type === 'text input') {
    //   let action = { streamOpenAiChatCompletion: { message: message } };

    //   const response = await executeClientSideAction({
    //     clientSideAction: action,
    //     context: {
    //       apiHost: props.context.apiHost,
    //       sessionId: props.context.sessionId,
    //       agentName: props.context.agentName,
    //       tabNumber: props.context.tabNumber,
    //     },
    //     onMessageStream: streamMessage,
    //   });
    //   return;
    // }

    const longRequest = setTimeout(() => {
      setIsSending(true);
    }, 2000);

    const { data, error } = await sendMessageQuery({
      apiHost: props.context.apiHost,
      sessionId: props.context.sessionId,
      agentName: props.context.agentName,
      tabNumber: props.context.tabNumber,
      message,
      clientLogs,
    });
    clearTimeout(longRequest);
    setIsSending(false);


    if (error) {
      setHasError(true);
      props.onNewLogs?.([
        {
          description: 'Failed to send the reply',
          details: error,
          status: 'error',
        },
      ]);
    }
    if (!data) return;
    if (data.logs) {
      props.onNewLogs?.(data.logs);
    }
    if (data.dynamicTheme) {
      setDynamicTheme(data.dynamicTheme);
    }
    if (data.input?.id && props.onNewInputBlock) {
      props.onNewInputBlock({
        id: data.input.id,
        groupId: data.input.groupId,
      });
    }
    if (data.clientSideActions) {
      const actionsBeforeFirstBubble = data.clientSideActions.filter((action) =>
        isNotDefined(action.lastBubbleBlockId)
      );
      for (const action of actionsBeforeFirstBubble) {
        if ('streamOpenAiChatCompletion' in action || 'webhookToExecute' in action) setIsSending(true);
        // Current action is {"streamOpenAiChatCompletion":{"messages":"Some content"}}

        const response = await executeClientSideAction({
          clientSideAction: action,
          context: {
            apiHost: props.context.apiHost,
            sessionId: props.context.sessionId,
            agentName: props.context.agentName,
          },
          onMessageStream: streamMessage,
        });
        if (response && 'replyToSend' in response) {
          // sendMessage(response.replyToSend, response.logs)
          return;
        }
        if (response && 'blockedPopupUrl' in response) setBlockedPopupUrl(response.blockedPopupUrl);
      }
    }


    if (data.input) {
      setActiveInputId((prev) => {
        return (prev + 1)
      });
    }

    setChatChunks((displayedChunks) => [
      ...displayedChunks,
      {
        input: data.input,
        messages: [...chatChunks()].pop()?.streamingMessageId ? data.messages.slice(1) : data.messages,
        clientSideActions: data.clientSideActions,
      },
    ]);
  };

  const autoScrollToBottom = (offsetTop?: number) => {
    setTimeout(() => {
      chatContainer?.scrollTo(0, offsetTop ?? chatContainer.scrollHeight);
    }, 50);
  };

  const handleAllBubblesDisplayed = async () => {
    const lastChunk = [...chatChunks()].pop();
    if (!lastChunk) return;
    if (isNotDefined(lastChunk.input)) {
      props.onEnd?.();
    }
  };

  const handleNewBubbleDisplayed = async (blockId: string) => {
    const lastChunk = [...chatChunks()].pop();
    if (!lastChunk) return;
    if (lastChunk.clientSideActions) {
      const actionsToExecute = lastChunk.clientSideActions.filter((action) => action.lastBubbleBlockId === blockId);
      for (const action of actionsToExecute) {
        if ('streamOpenAiChatCompletion' in action || 'webhookToExecute' in action) setIsSending(true);
        const response = await executeClientSideAction({
          clientSideAction: action,
          context: {
            apiHost: props.context.apiHost,
            sessionId: props.context.sessionId,
            agentName: props.context.agentName,
          },
          onMessageStream: streamMessage,
        });
        if (response && 'replyToSend' in response) {
          sendMessage(response.replyToSend, response.logs);
          return;
        }
        if (response && 'blockedPopupUrl' in response) setBlockedPopupUrl(response.blockedPopupUrl);
      }
    }
  };

  const handleSkip = () => sendMessage(undefined);

  onCleanup(() => {
    if (reader) {
      reader.cancel();
    }
    if (abortController) {
      abortController.abort();
    }
  });

  let inputCounter = 0;

  return (
    <div
      ref={chatContainer}
      class="flex flex-col overflow-y-scroll w-full min-h-full px-3 pt-10 relative scrollable-container agent-chat-view scroll-smooth gap-2"
    >
      <Show when={isConnecting() || props.isConnecting}>
        <ConnectingChunk />
      </Show>
      <For each={chatChunks()}>
        {(chatChunk, index) => {
          if (chatChunk.input) {
            inputCounter += 1;
          }
          return (
            <ChatChunk
              inputIndex={inputCounter}
              messages={chatChunk.messages}
              input={chatChunk.input}
              activeInputId={activeInputId()}
              theme={theme()}
              settings={props.initialAgentReply.agentConfig.settings}
              streamingMessageId={chatChunk.streamingMessageId}
              context={props.context}
              hideAvatar={!chatChunk.input && !chatChunk.streamingMessageId && index() < chatChunks().length - 1}
              hasError={hasError() && index() === chatChunks().length - 1}
              onNewBubbleDisplayed={handleNewBubbleDisplayed}
              onAllBubblesDisplayed={handleAllBubblesDisplayed}
              onSubmit={sendMessage}
              onScrollToBottom={autoScrollToBottom}
              onSkip={handleSkip}
            />
          );
        }}
      </For>
      <Show when={isSending()}>
        <LoadingChunk theme={theme()} />
      </Show>
      <Show when={blockedPopupUrl()} keyed>
        {(blockedPopupUrl) => (
          <div class="flex justify-end">
            <PopupBlockedToast url={blockedPopupUrl} onLinkClick={() => setBlockedPopupUrl(undefined)} />
          </div>
        )}
      </Show>
      <BottomSpacer />
    </div>
  );
}

const BottomSpacer = () => {
  return <div class="w-full h-32 flex-shrink-0" />
}
