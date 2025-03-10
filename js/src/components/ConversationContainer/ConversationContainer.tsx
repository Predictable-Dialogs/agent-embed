import { ChatReply, SendMessageInput, Theme } from '@/schemas';
import { createEffect, createSignal, For, onMount, Show, onCleanup } from 'solid-js';
import { sendMessageQuery } from '@/queries/sendMessageQuery';
import { ChatChunk } from './ChatChunk';
import { BotContext, ChatChunk as ChatChunkType, InitialChatReply, OutgoingLog } from '@/types';
import { isNotDefined } from '@/lib/utils';
import { executeClientSideAction } from '@/utils/executeClientSideActions';
import { LoadingChunk, ConnectingChunk } from './LoadingChunk';
import { PopupBlockedToast } from './PopupBlockedToast';
import { useInitialActions } from '@/hooks/useInitialActions';
import { transformMessage } from '@/utils/transformMessages';

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
});

type Props = {
  initialAgentReply: InitialChatReply;
  context: BotContext;
  onNewInputBlock?: (ids: { id: string; groupId: string }) => void;
  onAnswer?: (answer: { message: string; blockId: string }) => void;
  onEnd?: () => void;
  onNewLogs?: (logs: OutgoingLog[]) => void;
  setSessionId: (id: string | null) => void;
  filterResponse?: (response: string) => string;
  isConnecting?: boolean;
};

export const ConversationContainer = (props: Props) => {
  let chatContainer: HTMLDivElement | undefined;
  const [chatChunks, setChatChunks] = createSignal<ChatChunkType[]>([
    {
      input: props.initialAgentReply.input,
      messages: props.initialAgentReply.messages.map((msg: any) => 
        transformMessage(msg, 'assistant', props.initialAgentReply.input)
      ),
      clientSideActions: props.initialAgentReply.clientSideActions,
    },
  ]);
  const [dynamicTheme, setDynamicTheme] = createSignal<ChatReply['dynamicTheme']>(
    props.initialAgentReply.dynamicTheme
  );
  const [theme, setTheme] = createSignal(props.initialAgentReply.agentConfig.theme);
  const [isSending, setIsSending] = createSignal(false);
  const [isConnecting, setIsConnecting] = createSignal(false);
  const [blockedPopupUrl, setBlockedPopupUrl] = createSignal<string>();
  const [hasError, setHasError] = createSignal(false);
  const [activeInputId, setActiveInputId] = createSignal<number>(
    props.initialAgentReply.input ? 1 : 0
  );

  createEffect(() => {
    setTheme(parseDynamicTheme(props.initialAgentReply.agentConfig.theme, dynamicTheme()));
  });

  const executeInitialActions = useInitialActions({
    chatChunks,
    context: props.context,
    setIsConnecting,
    setBlockedPopupUrl,
  });

  onMount(() => {
    executeInitialActions();
  });

  createEffect(() => {
    setTheme(parseDynamicTheme(props.initialAgentReply.agentConfig.theme, dynamicTheme()));
  });

  const handleUserInput = async (userText: string) => {
    // Add user’s message to the conversation
    const userMessage = {
      id: crypto.randomUUID(), 
      createdAt: new Date().toISOString(),
      role: 'user',
      content: userText,
      parts: [] // empty parts array for now
    };

    setChatChunks((displayedChunks) => [
      ...displayedChunks,
      {
        messages: [userMessage],
      },
    ]);

    // Now that we’ve updated the UI, we can send the message to the server
    // to get the assistant’s new reply, etc.
    await sendMessage(userText);
  };

  const sendMessage = async (
    message: string | undefined,
    clientLogs?: SendMessageInput['clientLogs']
  ) => {
    setHasError(false);

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

    // Transform server messages to the new shape using our helper
    const messagesWithRole = data.messages.map((m: any) =>
      transformMessage(m, 'assistant')
    );
    
    if (data.input) {
      setActiveInputId((prev) => {
        return prev + 1;
      });
    }

    setChatChunks((displayedChunks) => [
      ...displayedChunks,
      {
        input: data.input,
        messages: messagesWithRole,
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
      const actionsToExecute = lastChunk.clientSideActions.filter(
        (action) => action.lastBubbleBlockId === blockId
      );
      for (const action of actionsToExecute) {
        if ('webhookToExecute' in action) setIsSending(true);
        const response = await executeClientSideAction({
          clientSideAction: action,
          context: {
            apiHost: props.context.apiHost,
            sessionId: props.context.sessionId,
            agentName: props.context.agentName,
          },
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
              hideAvatar={
                !chatChunk.input &&
                !chatChunk.streamingMessageId &&
                index() < chatChunks().length - 1
              }
              hasError={hasError() && index() === chatChunks().length - 1}
              onNewBubbleDisplayed={handleNewBubbleDisplayed}
              onAllBubblesDisplayed={handleAllBubblesDisplayed}
              onSubmit={handleUserInput}
              onScrollToBottom={autoScrollToBottom}
              onSkip={handleSkip}
              filterResponse={props.filterResponse}
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
            <PopupBlockedToast
              url={blockedPopupUrl}
              onLinkClick={() => setBlockedPopupUrl(undefined)}
            />
          </div>
        )}
      </Show>
      <BottomSpacer />
    </div>
  );
};

const BottomSpacer = () => {
  return <div class="w-full h-32 flex-shrink-0" />;
};
