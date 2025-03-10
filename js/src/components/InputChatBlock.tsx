import type {
  ChatReply, TextInputBlock,
  Theme
} from '../schemas';
import { BotContext, InputSubmitContent } from '@/types';
import { TextInput } from '@/features/blocks/inputs/textInput';
import { createSignal, Switch, Match } from 'solid-js';
import { isNotDefined } from '@/lib/utils';
import { isMobile } from '@/utils/isMobileSignal';

type Props = {
  ref: HTMLDivElement | undefined;
  block: NonNullable<ChatReply['input']>;
  hasHostAvatar: boolean;
  guestAvatar?: Theme['chat']['guestAvatar'];
  inputIndex: number;
  activeInputId: number;
  context: BotContext;
  isInputPrefillEnabled: boolean;
  hasError: boolean;
  onSubmit: (answer: string) => void;
  onSkip: () => void;
};

export const InputChatBlock = (props: Props) => {
  const [answer, setAnswer] = createSignal<string>();

  const handleSubmit = async ({ label, value }: InputSubmitContent) => {
    setAnswer(label ?? value);
    props.onSubmit(value ?? label);
  };

  const handleSkip = (label: string) => {
    setAnswer(label);
    props.onSkip();
  };

  return (
    <Switch>
      <Match when={isNotDefined(answer()) || props.hasError}> 
        {props.inputIndex === props.activeInputId && (
          <div
            class="flex justify-end animate-fade-in gap-2"
            data-blockid={props.block?.id}
            ref={props.ref}
          >
            {props.hasHostAvatar && (
              <div
                class={'flex flex-shrink-0 items-center ' + (isMobile() ? 'w-6 h-6' : 'w-10 h-10')}
              />
            )}
            <Input
              context={props.context}
              block={props.block}
              inputIndex={props.inputIndex}
              isInputPrefillEnabled={props.isInputPrefillEnabled}
              onSubmit={handleSubmit}
              onSkip={handleSkip}
            />
          </div>
         )}
        </Match>
    </Switch>
  );
};

const Input = (props: {
  context: BotContext;
  block: NonNullable<ChatReply['input']>;
  inputIndex: number;
  isInputPrefillEnabled: boolean;
  onSubmit: (answer: InputSubmitContent) => void;
  onSkip: (label: string) => void;
}) => {
  const onSubmit = (answer: InputSubmitContent) => props.onSubmit(answer);

  const getPrefilledValue = () =>
    props.isInputPrefillEnabled ? props.block?.prefilledValue : undefined;

  return (
    <TextInput
      block={props.block as TextInputBlock}
      defaultValue={getPrefilledValue()}
      onSubmit={onSubmit}
      streamingHandlers={undefined}
    />
  );
};