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
  isPersisted?: boolean;
};

export const HostBubble = (props: Props) => {
  const onTransitionEnd = (offsetTop?: number) => {
    props.onTransitionEnd(offsetTop);
  };
  
  return (
    <TextBubble
      content={props.message.content}
      typingEmulation={props.isPersisted ? {
        enabled: false,
        speed: 300,
        maxDelay: 1.5,
      } : props.typingEmulation}
      onTransitionEnd={props.isPersisted ? () => {} : onTransitionEnd}
      filterResponse={props.filterResponse}
      isPersisted={props.isPersisted}
    />
  );
};
