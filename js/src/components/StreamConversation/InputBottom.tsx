import type {
  ChatReply, TextInputBlock,
  Theme
} from '../../schemas';
import { BotContext } from '@/types';
import { InputText } from './InputText';
import { isMobile } from '@/utils/isMobileSignal';

type Props = {
  ref: HTMLDivElement | undefined;
  block: NonNullable<ChatReply['input']>;
  hasHostAvatar: boolean;
  guestAvatar?: Theme['chat']['guestAvatar'];
  context: BotContext;
  isInputPrefillEnabled: boolean;
  hasError: boolean;
  streamingHandlers?: {
    onInput?: (e: Event) => void;
    onSubmit: (e: Event) => void;
  };
};

export const InputBottom = (props: Props) => {
  return (
    <div
      class="flex justify-end animate-fade-in gap-2"
      data-blockid={props.block?.id}
    >
      {props.hasHostAvatar && (
        <div
          class={'flex flex-shrink-0 items-center ' + (isMobile() ? 'w-6 h-6' : 'w-10 h-10')}
        />
      )}
      <Input
        context={props.context}
        block={props.block}
        isInputPrefillEnabled={props.isInputPrefillEnabled}
        streamingHandlers={props.streamingHandlers}
      />
    </div>
  );
};

const Input = (props: {
  context: BotContext;
  block: NonNullable<ChatReply['input']>;
  isInputPrefillEnabled: boolean;
  streamingHandlers?: {
    onInput?: (e: Event) => void;
    onSubmit: (e: Event) => void;
  };
}) => {

  const getPrefilledValue = () =>
    props.isInputPrefillEnabled ? props.block?.prefilledValue : undefined;

  return (
    <InputText
      block={props.block as TextInputBlock}
      defaultValue={getPrefilledValue()}
      streamingHandlers={props.streamingHandlers}
    />
  );
};
