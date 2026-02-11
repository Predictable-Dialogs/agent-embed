import { ChatReply, Theme } from '@/schemas';
import { onMount, createEffect, createSignal, createMemo, For, Show, onCleanup } from 'solid-js'; // Added onCleanup
import { ChatChunk } from './ChatChunk';
import { FixedBottomInput } from './FixedBottomInput';
import { BotContext, InitialChatReply, WidgetContext, InitialPrompt, WelcomeContent } from '@/types';
import { MAX_INITIAL_PROMPTS } from '@/constants';
import { LoadingChunk, ErrorChunk } from './LoadingChunk';
import { AvatarConfig } from '@/constants';
import { useChat } from 'ai-sdk-solid';
import { DefaultChatTransport } from 'ai';
import { transformMessage, EnhancedUIMessage, getMessageText } from '@/utils/transformMessages';
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
  initialPrompts?: InitialPrompt[];
  welcome?: WelcomeContent;
  input: any
  context: BotContext;
  filterResponse?: (response: string) => string;
  onSessionExpired?: (payload?: { text?: string; files?: FileList | undefined }) => void;
  onSend?: () => void;
  widgetContext?: WidgetContext;
  pendingExpiredMessage?: { text?: string; files?: FileList | undefined };
  onPendingExpiredMessageConsumed?: () => void;
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
  const [pendingInputValue, setPendingInputValue] = createSignal('');
  const [lastSubmittedMessage, setLastSubmittedMessage] = createSignal<{ text?: string; files?: FileList | undefined }>();
  const [hasResentPendingMessage, setHasResentPendingMessage] = createSignal(false);
  let fileInputRef: HTMLInputElement | undefined;

  const initialPrompts = createMemo<InitialPrompt[]>(() =>
    (props.initialPrompts ?? []).filter((prompt) => Boolean(prompt?.text)).slice(0, MAX_INITIAL_PROMPTS)
  );
  const hasWelcomeContent = createMemo(
    () =>
      Boolean(
        props.welcome?.title ||
        props.welcome?.subtitle ||
        props.welcome?.icon ||
        props.welcome?.iconUrl
      )
  );

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
      ? props.persistedMessages.map((msg) => ({
          ...transformMessage({ ...msg }, msg.role, props.input),
          isPersisted: true,
        }))
      : props.initialAgentReply.messages.map((msg: any) => ({
          ...transformMessage({ ...msg }, 'assistant', props.input),
          isPersisted: false,
        }))
  );

  const chatHelpers = useChat({
    transport: new DefaultChatTransport({ 
      api: `${isNotEmpty(props.context.apiStreamHost) ? props.context.apiStreamHost : getApiStreamEndPoint()}`,
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          clientVersion: 'v5',
          message: getMessageText(messages[messages.length - 1]),
          sessionId: props.context.sessionId,
          agentName: props.context.agentName,
        }
      })
    }),
    messages: initialMessages(),  
    onError: (error) => {
      clearTimeout(longRequest);
      setIsSending(false);
      setIsFixedInputDisabled(false);
      if (error.message === 'Session expired. Starting a new session.') { 
        const payload = lastSubmittedMessage();
        props.onSessionExpired?.(payload);
      }
      
      if (error.message.includes('Unterminated string in JSON')) {
        console.log('⚠️ Ignoring JSON parse error from stream - likely due to incomplete response.');
        // Remove the incomplete assistant message to avoid displaying partial content
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            return prevMessages.slice(0, -1);
          }
          return prevMessages;
        });
        // Retry generating the response
        regenerate();
      }

      console.error('[StreamConversation] useChat error', { error });
    }
  });

  const messages = () => chatHelpers.messages;
  const status = () => chatHelpers.status;
  const error = () => chatHelpers.error;
  const setMessages = chatHelpers.setMessages;
  const sendMessage = chatHelpers.sendMessage;
  const regenerate = chatHelpers.regenerate;
  const hasUserMessages = createMemo(() =>
    messages().some((message) => message.role === 'assistant' || message.role === 'user')
  );
  const shouldShowInitialPrompts = createMemo(
    () =>
      (initialPrompts().length > 0 || hasWelcomeContent()) &&
      props.persistedMessages.length === 0 &&
      !hasUserMessages()
  );
  const isStreaming = createMemo(() => status() === 'streaming');
  
  const storage = useAgentStorage(props.context.agentName);
  
  createEffect(() => {
    const currentMessages = messages();
    storage.setChatMessages(currentMessages);
  });

  createEffect(() => {
    // Reset auto-resend guard whenever the pending message changes
    props.pendingExpiredMessage;
    setHasResentPendingMessage(false);
  });

  createEffect(() => {
    const currentMessages = messages();
    if (currentMessages.length > 0) {
      const lastMessage = currentMessages[currentMessages.length - 1];
    }
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

  createEffect(() => {
    const pending = props.pendingExpiredMessage;
    // const hasInitialMessages = (props.initialAgentReply.messages ?? []).length > 0;
    if (!pending || hasResentPendingMessage()) return;
    if (status() !== 'ready') return;

    const text = pending.text?.trim();
    if (!text) return;

    setHasResentPendingMessage(true);
    setdisplayIndex('#HIDE');
    setIsFixedInputDisabled(true);
    longRequest = setTimeout(() => {
      setIsSending(true);
    }, 2000);
    void sendMessage({
      text,
      files: pending.files,
    });
    props.onPendingExpiredMessageConsumed?.();
    autoScrollToBottom(true);
  });

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
    return {
      onInput: (event: Event) => {
        const target = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;
        setPendingInputValue(target?.value ?? '');
      },
      onSubmit: (e: Event) => {
        e.preventDefault();
        setdisplayIndex('#HIDE');
        setIsFixedInputDisabled(true);
        longRequest = setTimeout(() => {
          setIsSending(true);
        }, 2000);
        setLastSubmittedMessage({ text: pendingInputValue(), files: files() });
        void sendMessage({
          text: pendingInputValue(),
          files: files(),
        });

        setPendingInputValue('');

        // Reset form
        setFiles(undefined);
        if (fileInputRef) {
          fileInputRef.value = '';
        }

        autoScrollToBottom(true); // Force scroll to show user message
      },
    };
  });

  const handleInitialPromptClick = (prompt: InitialPrompt) => {
    if (!prompt?.text || isFixedInputDisabled() || isSending()) return;
    setdisplayIndex('#HIDE');
    setIsFixedInputDisabled(true);
    setLastSubmittedMessage({ text: prompt.text, files: undefined });
    longRequest = setTimeout(() => {
      setIsSending(true);
    }, 2000);
    props.onSend?.();
    setPendingInputValue('');
    setFiles(undefined);
    if (fileInputRef) {
      fileInputRef.value = '';
    }
    void sendMessage({
      text: prompt.text,
      files: undefined,
    });
    autoScrollToBottom(true);
  };

  onMount(() => {
    const currentMessages = messages();
    // if (currentMessages.length > 0) {
      const lastMessage = currentMessages?.[currentMessages.length - 1];
      // If the last message is from a user and is persisted, remove it
      if (lastMessage?.role === 'user' && (lastMessage as EnhancedUIMessage)?.isPersisted) {
        const filteredMessages = currentMessages.slice(0, -1);
        setMessages(filteredMessages);
        
        // If we have messages left, use the last one for displayIndex
        if (filteredMessages.length > 0) {
          const newLastMessage = filteredMessages[filteredMessages.length - 1];
          if (newLastMessage.id) {
            setdisplayIndex(newLastMessage.id);
          }
        }
      } else if (lastMessage?.id && (lastMessage as EnhancedUIMessage)?.isPersisted) {
        // Set display index for the last persisted message (if it's not a user message)
        setdisplayIndex(lastMessage.id);
      }

    autoScrollToBottom(true); // Force initial scroll to bottom

    queueMicrotask(() => {
      chatContainer?.classList.add('ready');
    });
    // }

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
      
      // Setup MutationObserver for DOM changes during streaming
      const observer = new MutationObserver((mutations) => {
        if (mutations.length > 0 && isStreaming()) {  // Only during active streaming
          autoScrollToBottom();
        }
      });

      observer.observe(chatContainer, {
        childList: true,    // Detect added/removed nodes (e.g., text chunks)
        subtree: true,      // Watch descendants (e.g., inside ChatChunk)
        characterData: true // Detect text content changes
      });
      
      // Cleanup scroll event listener and observer
      onCleanup(() => {
        if (chatContainer) {
          chatContainer.removeEventListener('scroll', handleScroll);
        }
        observer.disconnect();
        clearTimeout(scrollTimeout);
      });
    }
  });
  
  const isNearBottom = () => {
    if (!chatContainer) {
      return false;
    }
    // Force reflow: Access a geometric property to flush pending layout
    const _ = chatContainer.offsetHeight;  // Dummy read; browser computes fresh

    const threshold = 100;
    const { scrollHeight, scrollTop, clientHeight } = chatContainer;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < threshold;
    
    return nearBottom;
  };


  const autoScrollToBottom = (force: boolean = false) => {
    if (!chatContainer) {
      return;
    }
    requestAnimationFrame(() => {
      if (!chatContainer) {
        return;
      }
      const shouldScroll = force || isNearBottom();
      if (shouldScroll) {
        const scrollTarget = chatContainer.scrollHeight;
        chatContainer.scrollTo({
          top: scrollTarget,
          behavior: 'smooth',
        });
      }
    });
  };
  
  const onDisplayAssistantMessage = async () => {
    const currentMessages = messages();
    const lastMessage = currentMessages?.[currentMessages.length - 1];
    if(lastMessage?.id && currentMessages.length === 1) {
      setdisplayIndex(lastMessage.id);
    }
  };
  
  return (
    <div class="flex flex-col w-full items-center gap-4">
      <Show when={shouldShowInitialPrompts() && props.input}>
        <div class="px-3 pt-12 pb-5 mb-6 w-full flex justify-center">
          <div class="initial-prompts-panel w-full agent-input-container">
            <Show when={props.welcome?.title || props.welcome?.subtitle}>
              <div class="initial-prompts-heading">
                <Show when={props.welcome?.title}>
                  <div class="initial-prompts-title">
                    <Show when={props.welcome?.iconUrl}>
                      <span class="initial-prompts-title-icon">
                        <img src={props.welcome?.iconUrl} alt="" />
                      </span>
                    </Show>
                    <Show when={!props.welcome?.iconUrl && props.welcome?.icon}>
                      <span class="initial-prompts-title-icon">{props.welcome?.icon}</span>
                    </Show>
                    <span>{props.welcome?.title}</span>
                  </div>
                </Show>
                <Show when={props.welcome?.subtitle}>
                  <div class="initial-prompts-subtitle">
                    {props.welcome?.subtitle}
                  </div>
                </Show>
              </div>
            </Show>
            <div class="initial-prompts-list">
              <For each={initialPrompts()}>
                {(prompt) => (
                  <button
                    type="button"
                    class="initial-prompt-button"
                    onClick={() => handleInitialPromptClick(prompt)}
                  >
                    <Show when={prompt.iconUrl}>
                      <span class="initial-prompt-icon">
                        <img src={prompt.iconUrl} alt="" />
                      </span>
                    </Show>
                    <Show when={!prompt.iconUrl && prompt.icon}>
                      <span class="initial-prompt-icon">{prompt.icon}</span>
                    </Show>
                    <span class="initial-prompt-text">{prompt.text}</span>
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>

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
      <Show when={messages().length === 0 && props.input}>
        <FixedBottomInput
          block={props.input}
          isDisabled={isFixedInputDisabled()}
          streamingHandlers={streamingHandlers()}
          onSend={props.onSend}
          widgetContext={props.widgetContext}
        />
      </Show>
      <Show when={messages().length > 0 && props.input?.options?.type === 'fixed-bottom'}>
        <FixedBottomInput
          block={props.input}
          isDisabled={isFixedInputDisabled()}
          streamingHandlers={streamingHandlers()}
          onSend={props.onSend}
          widgetContext={props.widgetContext}
        />
      </Show>
    </div>
  );
};

const BottomSpacer = ({ type } : { type : string }) => {
  return <div 
          class="w-full flex-shrink-0"
          classList={{
            "h-16": type === "fixed-bottom",
            "h-32": type !== "fixed-bottom",
          }}
        />;
};
