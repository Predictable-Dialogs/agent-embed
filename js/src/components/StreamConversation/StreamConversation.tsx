import { ChatReply, Theme } from '@/schemas';
import { onMount, createEffect, createSignal, createMemo, For, Show } from 'solid-js';
import { ChatChunk } from './ChatChunk';
import { FixedBottomInput } from './FixedBottomInput';
import { BotContext, InitialChatReply, WidgetContext } from '@/types';
import { LoadingChunk, ErrorChunk } from './LoadingChunk';
import { useChat } from '@ai-sdk/solid';
import { transformMessage, EnhancedUIMessage } from '@/utils/transformMessages';
import { getApiStreamEndPoint } from '@/utils/getApiEndPoint';
import { useAgentStorage } from '@/hooks/useAgentStorage';
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
  filterResponse?: (response: string) => string;
  onSessionExpired?: () => void;
  widgetContext?: WidgetContext;
};

export const StreamConversation = (props: Props) => {
  let chatContainer: HTMLDivElement | undefined;
  const [dynamicTheme, setDynamicTheme] = createSignal<ChatReply['dynamicTheme']>(
    props.initialAgentReply.dynamicTheme
  );
  const [theme, setTheme] = createSignal(props.agentConfig.theme);
  const [isSending, setIsSending] = createSignal(false);
  const [displayIndex, setdisplayIndex] = createSignal('#HIDE');
  const [isFixedInputDisabled, setIsFixedInputDisabled] = createSignal(false);
  let longRequest: ReturnType<typeof setTimeout> | undefined;


  const [files, setFiles] = createSignal<FileList | undefined>(undefined);
  let fileInputRef: HTMLInputElement | undefined;

  createEffect(() => {
    setTheme(parseDynamicTheme(props.agentConfig.theme, dynamicTheme()));
  });

  const initialMessages = createMemo(() => 
    props.persistedMessages.length > 0
      ? props.persistedMessages.map(msg => ({ ...msg, isPersisted: true }))      
      : props.initialAgentReply.messages.map((msg: any) =>
        ({ ...transformMessage({ ...msg }, 'assistant', props.initialAgentReply.input), isPersisted: false })
      )
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
      initialMessages: initialMessages(),  
      experimental_prepareRequestBody({ messages }) {
        return {
          message: messages[messages.length - 1].content,
          // messages: messages,
          sessionId: props.context.sessionId,
          agentName: props.context.agentName,
        };
      },
      onError: (error) => {
        clearTimeout(longRequest);
        setIsSending(false);
        if (error.message === 'Session expired. Starting a new session.') { 
          props.onSessionExpired?.();
        }
      }
  });

  
  const storage = useAgentStorage(props.context.agentName);
  
  createEffect(() => {
    storage.setChatMessages(messages());
  });

  createEffect(() => {
    if (status() === 'ready') {
      const currentMessages = messages();
      if (currentMessages.length !== 1) {
        //The first message is not streamed so set this
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          setdisplayIndex(lastMessage.id);
          autoScrollToBottom();
        }  
      }
    }  
  })

  const streamingHandlers = createMemo(() => {
    if (!handleInputChange || !handleSubmit) return undefined;

    return {
      onInput: handleInputChange as (e: Event) => void,
      onSubmit: (e: Event) => {
        e.preventDefault();
        setdisplayIndex('#HIDE');
        setIsFixedInputDisabled(true);
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
    <>
      <div
        ref={chatContainer}
        class="flex flex-col overflow-y-scroll w-full min-h-full px-3 pt-10 relative scrollable-container agent-chat-view chat-container gap-2"
        style={{
          'padding-bottom': props.initialAgentReply.input?.options?.type === 'fixed-bottom' ? '200px' : undefined,
          'position': props.widgetContext === 'standard' ? 'relative' : undefined
        }}
      >
        <For each={messages()}>
          {(message) => {        
            if (message.role === 'assistant') {
              clearTimeout(longRequest);
              setIsSending(false);
              setIsFixedInputDisabled(false);
            }

            return (
              <ChatChunk
                displayIndex={displayIndex()}
                input={message.role === 'assistant' ? props.initialAgentReply.input : undefined}
                onDisplayAssistantMessage={onDisplayAssistantMessage}
                message={message}
                theme={theme()}
                settings={props.agentConfig.settings}
                streamingMessageId={undefined}
                context={props.context}
                hideAvatar={false}
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
        <BottomSpacer />
      </div>
        <Show when={props.initialAgentReply.input?.options?.type === 'fixed-bottom'}>
          <FixedBottomInput
            block={props.initialAgentReply.input}
            isDisabled={isFixedInputDisabled()}
            streamingHandlers={streamingHandlers()}
            widgetContext={props.widgetContext}
          />
        </Show>
    </>
  );
};

const BottomSpacer = () => {
  return <div class="w-full h-32 flex-shrink-0" />;
};
