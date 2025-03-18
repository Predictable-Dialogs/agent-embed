import { BotContext, ChatChunk as ChatChunkType } from '@/types';
import { isMobile } from '@/utils/isMobileSignal';
import type { ChatReply, Settings, Theme } from '@/schemas';
import { onMount, Show } from 'solid-js';
import { HostBubble } from '../bubbles/HostBubble';
import { AvatarSideContainer } from './AvatarSideContainer';
import { Match, Switch } from 'solid-js';
import { GuestBubble } from '../bubbles/GuestBubble';
import { StreamInput } from './StreamInput';

type Props =  {
  message: any;
  input?: ChatReply['input'];
  theme: Theme;
  settings: Settings;
  displayIndex: string;
  onDisplayAssistantMessage: (bubbleOffsetTop?: number) => void;
  context: BotContext;
  hasError: boolean;
  hideAvatar: boolean;
  streamingMessageId: ChatChunkType['streamingMessageId'];
  onScrollToBottom: (top?: number) => void;
  filterResponse?: (response: string) => string;
  streamingHandlers?: {
    onInput?: (e: Event) => void;
    onSubmit: (e: Event) => void;
  };
};

export const ChatChunk = (props: Props) => {
  let inputRef: HTMLDivElement | undefined;

  onMount(() => {
    if (props.streamingMessageId) return;
    props.onScrollToBottom(inputRef?.offsetTop ? inputRef?.offsetTop - 50 : undefined);
  });

  return (
    <div class="flex flex-col w-full min-w-0 gap-2">
      <div class={'flex' + (isMobile() ? ' gap-1' : ' gap-2')}>
        <Switch fallback={null}>
          <Match when={props.message.role === 'assistant'}>
            <Show
              when={props.theme.chat.hostAvatar?.isEnabled}
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
                message={props.message}
                typingEmulation={props.settings.typingEmulation}
                onTransitionEnd={props.onDisplayAssistantMessage}
                filterResponse={props.filterResponse}
              />
            </div>
          </Match>
          <Match when={props.message.role === 'user'}>
            <div class="flex flex-col flex-1">
              <GuestBubble
                message={props.message.content} // or however you store user text
                showAvatar={props.theme.chat.guestAvatar?.isEnabled ?? false}
                avatarSrc={props.theme.chat.guestAvatar?.url}
              />
            </div>
          </Match>
        </Switch>
      </div>
      {props.input && (props.message.id === props.displayIndex) && (
        <StreamInput
          ref={inputRef}
          block={props.input}
          hasHostAvatar={props.theme.chat.hostAvatar?.isEnabled ?? false}
          guestAvatar={props.theme.chat.guestAvatar}
          context={props.context}
          isInputPrefillEnabled={props.settings.general.isInputPrefillEnabled ?? true}
          hasError={props.hasError}
          streamingHandlers={props.streamingHandlers}
        />
      )} 
    </div>
  );
};
