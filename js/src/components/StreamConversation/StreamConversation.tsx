import { ChatReply, Theme } from '@/schemas';
import { onMount, createEffect, createSignal, createMemo, For, Show, onCleanup } from 'solid-js'; // Added onCleanup
import { ChatChunk } from './ChatChunk';
import { FixedBottomInput } from './FixedBottomInput';
import { BotContext, InitialChatReply, WidgetContext } from '@/types';
import { LoadingChunk, ErrorChunk } from './LoadingChunk';
import { AvatarConfig } from '@/constants';
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
  hostAvatar?: AvatarConfig;
  guestAvatar?: AvatarConfig;
  input: any
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
  const [isSending, setIsSending] = createSignal(false);
  const [displayIndex, setdisplayIndex] = createSignal('#HIDE');
  const [isFixedInputDisabled, setIsFixedInputDisabled] = createSignal(false);
  const [isScrolling, setIsScrolling] = createSignal(false);
  const [scrollOccurredDuringStreaming, setScrollOccurredDuringStreaming] = createSignal(false);
  const [forceReposition, setForceReposition] = createSignal(false);
  let longRequest: ReturnType<typeof setTimeout> | undefined;
  let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

  const [files, setFiles] = createSignal<FileList | undefined>(undefined);
  let fileInputRef: HTMLInputElement | undefined;

  const theme = createMemo(() => {
    const dyn = dynamicTheme();
    const base = props.agentConfig.theme;
    const host = props.hostAvatar ?? base?.chat?.hostAvatar;
    const guest = props.guestAvatar ?? base?.chat?.guestAvatar;
    return parseDynamicTheme({
      ...base,
      chat: {
        ...base.chat,
        hostAvatar: host,
        guestAvatar: guest,
      }
    }, dyn);
  });

  const initialMessages = createMemo(() => 
    props.persistedMessages.length > 0
      ? props.persistedMessages.map(msg => ({ ...msg, isPersisted: true }))      
      : props.initialAgentReply.messages.map((msg: any) =>
        ({ ...transformMessage({ ...msg }, 'assistant', props.input), isPersisted: false })
      )
  );

  const {
    status,
    messages,
    setMessages,
    data,
    error,
    handleInputChange,
    handleSubmit,
    reload
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
        if (error.message.includes('Unterminated string in JSON')) {
          console.info('⚠️ Ignoring JSON parse error from stream - likely due to incomplete response.');
          // Remove the incomplete assistant message to avoid displaying partial content
          setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return prevMessages.slice(0, -1);
            }
            return prevMessages;
          });
          // Retry generating the response
          reload();
        }
      }
  });

  const isStreaming = createMemo(() => status() === 'streaming');
  
  const storage = useAgentStorage(props.context.agentName);
  
  createEffect(() => {
    storage.setChatMessages(messages());
  });

  createEffect(() => {
    const currentMessages = messages();
    console.log('💬 Messages effect triggered. Message count:', currentMessages.length);
    if (currentMessages.length > 0) {
      const lastMessage = currentMessages[currentMessages.length - 1];
      console.log('📝 Last message:', {
        role: lastMessage.role,
        id: lastMessage.id,
        contentLength: lastMessage.content?.length || 0
      });
    }
    console.log('🔄 Calling autoScrollToBottom from messages effect...');
    autoScrollToBottom(); // Defaults to force=false, so checks isNearBottom
  });

  createEffect(() => {
    if (status() === 'ready') {
      const currentMessages = messages();
      if (currentMessages.length !== 1) {
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          setdisplayIndex(lastMessage.id);
        }  
      }
    }  
  })

  // Track when scrolling starts during streaming
  createEffect(() => {
    if (isScrolling() && status() === 'streaming' && !scrollOccurredDuringStreaming()) {
      setScrollOccurredDuringStreaming(true);
    }
  });

  // Handle avatar repositioning after streaming ends and scrolling stops
  createEffect(() => {
    if (status() === 'ready' && !isScrolling() && scrollOccurredDuringStreaming()) {
      // Trigger force reposition to drop avatar to proper position
      setForceReposition(true);
      // Reset the flag
      setScrollOccurredDuringStreaming(false);
      // Reset force reposition after a brief moment
      setTimeout(() => setForceReposition(false), 50);
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

        console.log('📤 User submitted message, calling forced scroll...');
        autoScrollToBottom(true); // Force scroll to show user message
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

      console.log('🏁 onMount: Calling initial forced scroll...');
      autoScrollToBottom(true); // Force initial scroll to bottom

      queueMicrotask(() => {
        chatContainer?.classList.add('ready');
      });
    }

    // Add scroll event listener to track scrolling state - needed for host avatar container.
    if (chatContainer) {
      const handleScroll = () => {
        setIsScrolling(true);
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setIsScrolling(false);
        }, 300); // Debounce: consider scrolling stopped after 150ms of inactivity
      };

      chatContainer.addEventListener('scroll', handleScroll, { passive: true });
      
      // Cleanup scroll event listener
      onCleanup(() => {
        if (chatContainer) {
          chatContainer.removeEventListener('scroll', handleScroll);
        }
        clearTimeout(scrollTimeout);
      });
    }
  });
  
  const isNearBottom = () => {
    if (!chatContainer) {
      console.log('🔴 isNearBottom: chatContainer is null');
      return false;
    }
    const threshold = 100; // Adjustable; pixels from bottom to consider "near"
    const { scrollHeight, scrollTop, clientHeight } = chatContainer;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < threshold;
    console.log('📏 isNearBottom:', {
      scrollHeight,
      scrollTop,
      clientHeight,
      distanceFromBottom,
      threshold,
      nearBottom
    });
    return nearBottom;
  };

  const autoScrollToBottom = (force: boolean = false) => {
    console.log('🚀 autoScrollToBottom called with force:', force);
    if (!chatContainer) {
      console.log('🔴 autoScrollToBottom: chatContainer is null');
      return;
    }
    console.log('⏱️ autoScrollToBottom: Setting timeout...');
    setTimeout(() => {
      if (!chatContainer) {
        console.log('🔴 autoScrollToBottom timeout: chatContainer is null');
        return;
      }
      const shouldScroll = force || isNearBottom();
      console.log('🤔 autoScrollToBottom: shouldScroll =', shouldScroll, '(force:', force, ')');
      if (shouldScroll) {
        const scrollTarget = chatContainer.scrollHeight;
        chatContainer.scrollTo({
          top: scrollTarget,
          behavior: 'auto', // 'auto' for instant; change to 'smooth' if preferred for UX
        });
        console.log('✅ Scroll command executed');
      } else {
        console.log('⏭️ Scroll skipped - not near bottom and not forced');
      }
    }, 0);
  };
  
  const onDisplayAssistantMessage = async () => {
    const currentMessages = messages();
    const lastMessage = currentMessages?.[currentMessages.length - 1];
    if(lastMessage?.id && currentMessages.length === 1) {
      setdisplayIndex(lastMessage.id);
    }
  };
  
  return (
    <>
      <div
        ref={chatContainer}
        class="flex flex-col w-full px-3 pt-10 relative scrollable-container agent-chat-view chat-container gap-2"
        classList={{
          'h-full': true,
          'overflow-y-scroll': true
        }}
        style={{
          'height': '100%',
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
                input={message.role === 'assistant' ? props.input : undefined}
                onDisplayAssistantMessage={onDisplayAssistantMessage}
                message={message}
                theme={theme()}
                settings={props.agentConfig.settings}
                streamingMessageId={undefined}
                hideAvatar={false}
                streamingHandlers={streamingHandlers()}
                filterResponse={props.filterResponse}
                isPersisted={(message as EnhancedUIMessage).isPersisted ?? false}
                isStreaming={isStreaming()}
                scrollOccurredDuringStreaming={scrollOccurredDuringStreaming()}
                forceReposition={forceReposition()}
              />
            );
          }}
        </For>

        <Show when={isSending()}>
          <LoadingChunk theme={theme()} />
        </Show>

        <Show when={error() && !error()?.message?.includes('Unterminated string in JSON')}>
          <ErrorChunk message={error()?.message} theme={theme()} />
        </Show>
        <BottomSpacer type={props.input?.options?.type}/>
      </div>
        <Show when={props.input?.options?.type === 'fixed-bottom'}>
          <FixedBottomInput
            block={props.input}
            isDisabled={isFixedInputDisabled()}
            streamingHandlers={streamingHandlers()}
            widgetContext={props.widgetContext}
          />
        </Show>
    </>
  );
};

const BottomSpacer = ({ type } : { type : string }) => {
  console.log("BottomSpacer type:", type);
  return <div 
          class="w-full flex-shrink-0"
          classList={{
            "h-16": type === "fixed-bottom",
            "h-32": type !== "fixed-bottom",
          }}
        />;
};