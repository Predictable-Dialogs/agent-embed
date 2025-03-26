import { ChatReply, Theme } from '@/schemas';
import { createEffect, createSignal, createMemo, For, Show } from 'solid-js';
import { ChatChunk } from './ChatChunk';
import { BotContext, InitialChatReply, OutgoingLog } from '@/types';
import { LoadingChunk, ConnectingChunk, ErrorChunk } from './LoadingChunk';
import { PopupBlockedToast } from './PopupBlockedToast';
import { useChat } from '@ai-sdk/solid';
import { transformMessage, EnhancedUIMessage } from '@/utils/transformMessages';
import { getApiStreamEndPoint } from '@/utils/getApiEndPoint';
import { isNotEmpty } from '@/lib/utils';
import { InputBottom } from './InputBottom';

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

export const StreamConversation = (props: Props) => {
  let chatContainer: HTMLDivElement | undefined;
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
  const [displayIndex, setdisplayIndex] = createSignal('#HIDE');
  let longRequest: NodeJS.Timeout;


  const [files, setFiles] = createSignal<FileList | undefined>(undefined);
  let fileInputRef: HTMLInputElement | undefined;

  createEffect(() => {
    setTheme(parseDynamicTheme(props.initialAgentReply.agentConfig.theme, dynamicTheme()));
  });

  createEffect(() => {
    setTheme(parseDynamicTheme(props.initialAgentReply.agentConfig.theme, dynamicTheme()));
  });

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
      initialMessages: props.initialAgentReply.messages.map((msg: any) =>
        transformMessage({...msg }, 'assistant', props.initialAgentReply.input)
      ),  
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
        setActiveInputId((prev) => prev + 1);    
      },
      onError: (error) => {
        clearTimeout(longRequest);
        setIsSending(false);
        console.error('Error in chat:', error);
      }
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

  const autoScrollToBottom = (offsetTop?: number) => {
    setTimeout(() => {
      chatContainer?.scrollTo(0, offsetTop ?? chatContainer.scrollHeight);
    }, 50);
  };

  
  const onDisplayAssistantMessage = async (bubbleOffsetTop?: number) => {
    const currentMessages = messages();
    const lastMessageId = currentMessages?.[currentMessages.length - 1]?.id;
    if(lastMessageId) {
      setdisplayIndex(lastMessageId);
    }
    autoScrollToBottom(bubbleOffsetTop);
  };
    
  return (
    <div
      ref={chatContainer}
      class="flex flex-col overflow-y-scroll w-full min-h-full px-3 pt-10 relative scrollable-container agent-chat-view scroll-smooth gap-2"
    >
      <Show when={isConnecting() || props.isConnecting}>
        <ConnectingChunk />
      </Show>

      <For each={messages()}>
        {(message) => {        
          const inputValue = message.role === 'assistant' ? 
            ((message as EnhancedUIMessage).input || props.initialAgentReply.input) : 
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
              settings={props.initialAgentReply.agentConfig.settings}
              streamingMessageId={undefined}
              context={props.context}
              hideAvatar={false}
              hasError={hasError()}
              streamingHandlers={streamingHandlers()}
              onScrollToBottom={autoScrollToBottom}
              filterResponse={props.filterResponse}
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
      {props.initialAgentReply.input && (props.initialAgentReply.input?.options?.placement === "bottom") && (
        <div class="absolute bottom-0 left-0 right-0 p-3 z-10">
          <InputBottom
            ref={undefined}
            block={props.initialAgentReply.input}
            hasHostAvatar={theme().chat.hostAvatar?.isEnabled ?? false}
            guestAvatar={theme().chat.guestAvatar}
            context={props.context}
            isInputPrefillEnabled={false}
            hasError={hasError()}
            streamingHandlers={streamingHandlers()}
            />
          </div>
      )} 
      <BottomSpacer />
    </div>
  );
};

const BottomSpacer = () => {
  return <div class="w-full h-32 flex-shrink-0" />;
};
