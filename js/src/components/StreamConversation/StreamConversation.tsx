import { ChatReply, Theme } from '@/schemas';
import { onMount, createEffect, createSignal, createMemo, For, Show } from 'solid-js';
import { ChatChunk } from './ChatChunk';
import { BotContext, InitialChatReply, OutgoingLog } from '@/types';
import { LoadingChunk, ErrorChunk } from './LoadingChunk';
import { PopupBlockedToast } from './PopupBlockedToast';
import { useChat } from '@ai-sdk/solid';
import { transformMessage, EnhancedUIMessage } from '@/utils/transformMessages';
import { getApiStreamEndPoint } from '@/utils/getApiEndPoint';
import { isNotEmpty } from '@/lib/utils';

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
  persistedMessages: any[];
  agentConfig: any;
  context: BotContext;
  onNewInputBlock?: (ids: { id: string; groupId: string }) => void;
  onAnswer?: (answer: { message: string; blockId: string }) => void;
  onEnd?: () => void;
  onNewLogs?: (logs: OutgoingLog[]) => void;
  filterResponse?: (response: string) => string;
  onSessionExpired?: () => void;
};

export const StreamConversation = (props: Props) => {
  let chatContainer: HTMLDivElement | undefined;
  const [dynamicTheme, setDynamicTheme] = createSignal<ChatReply['dynamicTheme']>(
    props.initialAgentReply.dynamicTheme
  );
  const [theme, setTheme] = createSignal(props.agentConfig.theme);
  const [isSending, setIsSending] = createSignal(false);
  const [blockedPopupUrl, setBlockedPopupUrl] = createSignal<string>();
  const [hasError, setHasError] = createSignal(false);
  const [activeInputId, setActiveInputId] = createSignal<number>(
    props.initialAgentReply.input ? 1 : 0
  );
  const [displayIndex, setdisplayIndex] = createSignal('#HIDE');
  let longRequest: NodeJS.Timeout;


  const [files, setFiles] = createSignal<FileList | undefined>(undefined);
  let fileInputRef: HTMLInputElement | undefined;

  createEffect(() => {
    setTheme(parseDynamicTheme(props.agentConfig.theme, dynamicTheme()));
  });

  const initialMessages = props.persistedMessages.length > 0
    ? props.persistedMessages.map(msg => ({ ...msg, isPersisted: true }))      
    : props.initialAgentReply.messages.map((msg: any) =>
      ({ ...transformMessage({ ...msg }, 'assistant', props.initialAgentReply.input), isPersisted: false })
  );

  const {
    status,
    messages,
    setMessages,
    data,
    error,
    handleInputChange,
    handleSubmit
  } = useChat({
      api: `${isNotEmpty(props.context.apiStreamHost) ? props.context.apiStreamHost : getApiStreamEndPoint()}`,
      streamProtocol: 'data',
      initialMessages,  
      experimental_prepareRequestBody({ messages }) {
        return {
          message: messages[messages.length - 1].content,
          // messages: messages,
          sessionId: props.context.sessionId,
          agentName: props.context.agentName,
        };
      },
      onResponse: (response) => {
      },
      onFinish: (message, options) => {
        const currentMessages = messages();
        const lastMessage = currentMessages?.[currentMessages.length - 1];
        if(lastMessage?.id) {
          setdisplayIndex(lastMessage.id);
        }
        
        autoScrollToBottom();
      },
      onError: (error) => {
        clearTimeout(longRequest);
        setIsSending(false);
        if (error.message === 'Session expired. Starting a new session.') { 
          props.onSessionExpired?.();
        }
      }
  });
  
  const getStorageKey = (key: string) => {
    return props.context.agentName ? `${props.context.agentName}_${key}` : key;
  };
  
  createEffect(() => {
    localStorage.setItem(getStorageKey('chatMessages'), JSON.stringify(messages()));
  });

  const streamingHandlers = createMemo(() => {
    if (!handleInputChange || !handleSubmit) return undefined;

    return {
      onInput: handleInputChange as (e: Event) => void,
      onSubmit: (e: Event) => {
        e.preventDefault();
        setdisplayIndex('#HIDE');
        longRequest = setTimeout(() => {
          setIsSending(true);
        }, 2000);
        handleSubmit(e, {
          experimental_attachments: files(),
        });

        // Reset form
        setFiles(undefined);
        if (fileInputRef) {
          fileInputRef.value = '';
        }
      },
    };
  });

  onMount(() => {
    const currentMessages = messages();
    if (currentMessages.length > 0) {
      const lastMessage = currentMessages?.[currentMessages.length - 1];
      // If the last message is from a user and is persisted, remove it
      if (lastMessage.role === 'user' && (lastMessage as EnhancedUIMessage).isPersisted) {
        const filteredMessages = currentMessages.slice(0, -1);
        setMessages(filteredMessages);
        
        // If we have messages left, use the last one for displayIndex
        if (filteredMessages.length > 0) {
          const newLastMessage = filteredMessages[filteredMessages.length - 1];
          if (newLastMessage.id) {
            setdisplayIndex(newLastMessage.id);
          }
        }
      } else if (lastMessage.id && (lastMessage as EnhancedUIMessage).isPersisted) {
        // Set display index for the last persisted message (if it's not a user message)
        setdisplayIndex(lastMessage.id);
      }

      setTimeout(() => {        
        chatContainer?.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'auto',
        });

        queueMicrotask(() => {
          chatContainer?.classList.add('scroll-smooth');
          chatContainer?.classList.add('ready');
        });      
      }, 50);
    }
  });
  
  const autoScrollToBottom = (offsetTop?: number) => {
    setTimeout(() => {
      chatContainer?.scrollTo(0, offsetTop ?? chatContainer.scrollHeight);
    }, 50);
  };

  
  const onDisplayAssistantMessage = async (bubbleOffsetTop?: number) => {
    const currentMessages = messages();
    const lastMessage = currentMessages?.[currentMessages.length - 1];
    if(lastMessage?.id && currentMessages.length === 1) {
      // the first message is not streamed so set this.
      setdisplayIndex(lastMessage.id);
      autoScrollToBottom(bubbleOffsetTop);
    }
  };
    
  return (
    <div
      ref={chatContainer}
      class="flex flex-col overflow-y-scroll w-full min-h-full px-3 pt-10 relative scrollable-container agent-chat-view chat-container gap-2"
    >
      <For each={messages()}>
        {(message) => {        
          const inputValue = message.role === 'assistant' ? 
            (initialMessages[0]?.input || props.initialAgentReply.input) : 
            undefined;
          
          if (message.role === 'assistant') {
            clearTimeout(longRequest);
            setIsSending(false);
          }

          return (
            <ChatChunk
              displayIndex={displayIndex()}
              input={inputValue}
              onDisplayAssistantMessage={onDisplayAssistantMessage}
              message={message}
              theme={theme()}
              settings={props.agentConfig.settings}
              streamingMessageId={undefined}
              context={props.context}
              hideAvatar={false}
              hasError={hasError()}
              streamingHandlers={streamingHandlers()}
              onScrollToBottom={autoScrollToBottom}
              filterResponse={props.filterResponse}
              isPersisted={(message as EnhancedUIMessage).isPersisted ?? false}
            />
          );
        }}
      </For>

      <Show when={isSending()}>
        <LoadingChunk theme={theme()} />
      </Show>

      <Show when={error()}>
        <ErrorChunk message={error()?.message} theme={theme()} />
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
