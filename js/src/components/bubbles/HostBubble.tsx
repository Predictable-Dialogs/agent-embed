import { TextBubble } from '@/features/blocks/bubbles/textBubble';
import type {
  TypingEmulation
} from '@/schemas';

type Props = {
  message: {
    content: string;
  };
  // messages: any;
  typingEmulation: TypingEmulation;
  onTransitionEnd: (offsetTop?: number) => void;
  filterResponse?: (response: string) => string;
};

export const HostBubble = (props: Props) => {
  const onTransitionEnd = (offsetTop?: number) => {
    props.onTransitionEnd(offsetTop);
  };
  
  return (
    <TextBubble
      content={props.message.content}
      typingEmulation={props.typingEmulation}
      onTransitionEnd={onTransitionEnd}
      filterResponse={props.filterResponse}
    />
  );
};
