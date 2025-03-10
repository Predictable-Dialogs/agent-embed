import { ChatReply, Theme } from '@/schemas';
import { createEffect, createSignal, createMemo, For, Show } from 'solid-js';
import { ChatChunk } from './ChatChunk';
import { BotContext, InitialChatReply, OutgoingLog } from '@/types';
import { LoadingChunk, ConnectingChunk } from './LoadingChunk';
import { PopupBlockedToast } from './PopupBlockedToast';
import { useChat } from '@ai-sdk/solid';
import { transformMessage, EnhancedUIMessage } from '@/utils/transformMessages';

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
  const [inputIndex, setInputIndex] = createSignal<number>(
    props.initialAgentReply.input ? 1 : 0
  );
  const [displayIndex, setdisplayIndex] = createSignal('#HIDE');


  const [files, setFiles] = createSignal<FileList | undefined>(undefined);
  let fileInputRef: HTMLInputElement | undefined;

  createEffect(() => {
    setTheme(parseDynamicTheme(props.initialAgentReply.agentConfig.theme, dynamicTheme()));
  });

  createEffect(() => {
    setTheme(parseDynamicTheme(props.initialAgentReply.agentConfig.theme, dynamicTheme()));
  });

  const {
    messages,
    handleInputChange,
    handleSubmit
  } = useChat({
      api: 'http://localhost:8001/web/stream_',
      streamProtocol: 'text',
      initialMessages: props.initialAgentReply.messages.map((msg: any) =>
        transformMessage({...msg, id: '0'}, 'assistant', props.initialAgentReply.input)
      ),  
      experimental_prepareRequestBody({ messages }) {
        return {
          message: messages[messages.length - 1].content,
          sessionId: props.context.sessionId,
          agentName: props.context.agentName,
        };
      },
      onResponse: (response) => {
        setInputIndex((prev) => prev + 1);
        console.log('Received HTTP response from server:', response);
      },
      onFinish: () => {
        setActiveInputId((prev) => prev + 1);    
      }
    });
  
  const streamingHandlers = createMemo(() => {
    if (!handleInputChange || !handleSubmit) return undefined;

    return {
      onInput: handleInputChange as (e: Event) => void,
      onSubmit: (e: Event) => {
        e.preventDefault();
        setdisplayIndex('#HIDE');
        console.log(`streaming submit ...`);
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
    console.log(`setting displayed message index: ${lastMessageId}`);
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
          console.log("🔄 <For> Executing for message:", JSON.stringify(message));          
          
          const inputValue = message.role === 'assistant' ? 
            ((message as EnhancedUIMessage).input || props.initialAgentReply.input) : 
            undefined;

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
