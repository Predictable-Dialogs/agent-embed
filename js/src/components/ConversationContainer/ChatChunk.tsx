import { BotContext, ChatChunk as ChatChunkType } from '@/types';
import { isMobile } from '@/utils/isMobileSignal';
import type { ChatReply, Settings, Theme } from '@/schemas';
import { createSignal, For, onMount, Show } from 'solid-js';
import { HostBubble } from '../bubbles/HostBubble';
import { InputChatBlock } from '../InputChatBlock';
import { AvatarSideContainer } from './AvatarSideContainer';
import { Match, Switch } from 'solid-js';
import { GuestBubble } from '../bubbles/GuestBubble';
import { StreamingBubble } from '../bubbles/StreamingBubble';

type Props = Pick<ChatReply, 'messages' | 'input'> & {
  theme: Theme;
  settings: Settings;
  inputIndex: number;
  activeInputId: number;
  context: BotContext;
  hasError: boolean;
  hideAvatar: boolean;
  streamingMessageId: ChatChunkType['streamingMessageId'];
  onNewBubbleDisplayed: (blockId: string) => Promise<void>;
  onScrollToBottom: (top?: number) => void;
  onSubmit: (input: string) => void;
  onSkip: () => void;
  onAllBubblesDisplayed: () => void;
  filterResponse?: (response: string) => string;
  streamingHandlers?: {
    onInput?: (e: Event) => void;
    onSubmit: (e: Event) => void;
  };
};

export const ChatChunk = (props: Props) => {
  let inputRef: HTMLDivElement | undefined;
  const [displayedMessageIndex, setDisplayedMessageIndex] = createSignal(0);

  onMount(() => {
    if (props.streamingMessageId) return;
    props.onScrollToBottom(inputRef?.offsetTop ? inputRef?.offsetTop - 50 : undefined);
  });

  const displayNextMessage = async (bubbleOffsetTop?: number) => {
    console.log(`displayNextMessage: ${displayedMessageIndex()}`);
    const index = displayedMessageIndex();
    const lastBubbleBlockId = props.messages[index].id;

    //Execute action for the last block.
    await props.onNewBubbleDisplayed(lastBubbleBlockId);

    // setDisplayedMessageIndex(index === props.messages.length ? index : index + 1);
    if (index !== props.messages.length) {
      console.log(`Incrementing displayed message index`);
      setDisplayedMessageIndex(index + 1);
    }

    props.onScrollToBottom(bubbleOffsetTop);

    if (index === props.messages.length) {
      props.onAllBubblesDisplayed();
    }
  };

  return (
    <div class="flex flex-col w-full min-w-0 gap-2">
      <Show when={props.messages.length > 0}>
        <div class={'flex' + (isMobile() ? ' gap-1' : ' gap-2')}>
          <For each={props.messages.slice(0, displayedMessageIndex() + 1)}>
            {(message) => {
              console.log('Rendering message:', JSON.stringify(message));
              return (
                <Switch fallback={null}>
                  <Match when={message.role === 'assistant'}>
                    <Show
                      when={props.theme.chat.hostAvatar?.isEnabled && props.messages.length > 0}
                    >
                      <AvatarSideContainer
                        hostAvatarSrc={props.theme.chat.hostAvatar?.url}
                        hideAvatar={props.hideAvatar}
                      />
                    </Show>

                    <div
                      class="flex flex-col flex-1 gap-2"
                      style={{
                        'margin-right': props.theme.chat.guestAvatar?.isEnabled
                          ? isMobile()
                            ? '32px'
                            : '48px'
                          : undefined,
                      }}
                    >
                      <HostBubble
                        message={message}
                        typingEmulation={props.settings.typingEmulation}
                        onTransitionEnd={displayNextMessage}
                        filterResponse={props.filterResponse}
                      />
                    </div>
                  </Match>
                  <Match when={message.role === 'user'}>
                    <div class="flex flex-col flex-1">
                      <GuestBubble
                        message={message.content.text} // or however you store user text
                        showAvatar={props.theme.chat.guestAvatar?.isEnabled ?? false}
                        avatarSrc={props.theme.chat.guestAvatar?.url}
                      />
                    </div>
                  </Match>
                </Switch>
              );
            }}
          </For>
        </div>
      </Show>
      {props.input && displayedMessageIndex() === props.messages.length && (
        <InputChatBlock
          ref={inputRef}
          block={props.input}
          inputIndex={props.inputIndex}
          activeInputId={props.activeInputId}
          onSubmit={props.onSubmit}
          onSkip={props.onSkip}
          hasHostAvatar={props.theme.chat.hostAvatar?.isEnabled ?? false}
          guestAvatar={props.theme.chat.guestAvatar}
          context={props.context}
          isInputPrefillEnabled={props.settings.general.isInputPrefillEnabled ?? true}
          hasError={props.hasError}
          streamingHandlers={props.streamingHandlers}
        />
      )}
      <Show when={props.streamingMessageId} keyed>
        {(streamingMessageId) => (
          <div class={'flex' + (isMobile() ? ' gap-1' : ' gap-2')}>
            <Show when={props.theme.chat.hostAvatar?.isEnabled}>
              <AvatarSideContainer
                hostAvatarSrc={props.theme.chat.hostAvatar?.url}
                hideAvatar={props.hideAvatar}
              />
            </Show>

            <div
              class="flex flex-col flex-1 gap-2"
              style={{
                'margin-right': props.theme.chat.guestAvatar?.isEnabled
                  ? isMobile()
                    ? '32px'
                    : '48px'
                  : undefined,
              }}
            >
              <StreamingBubble streamingMessageId={streamingMessageId} />
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};
