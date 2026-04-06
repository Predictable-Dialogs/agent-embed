import { TextBubble } from '@/features/blocks/bubbles/textBubble';
import type {
  TypingEmulation
} from '@/schemas';
import type { FeedbackType } from '@/queries/sendFeedbackQuery';

type MessageLike = {
  parts?: Array<{ type?: string; text?: string }>;
  content?: string;
};

type Props = {
  message: MessageLike;
  typingEmulation: TypingEmulation;
  onTransitionEnd: (offsetTop?: number) => void;
  filterResponse?: (response: string) => string;
  isPersisted?: boolean;
  showActionBar?: boolean;
  isCorrectivePopupEnabled?: boolean;
  selectedFeedbackType?: FeedbackType;
  isFeedbackPending?: boolean;
  onFeedbackSubmit?: (payload: {
    messageId: string;
    type: FeedbackType;
    correctiveAnswer?: string;
  }) => void | Promise<void>;
};

export const HostBubble = (props: Props) => {
  const onTransitionEnd = (offsetTop?: number) => {
    props.onTransitionEnd(offsetTop);
  };
  
  return (
    <TextBubble
      message={props.message}
      typingEmulation={props.isPersisted ? {
        enabled: false,
        speed: 300,
        maxDelay: 1.5,
      } : props.typingEmulation}
      onTransitionEnd={props.isPersisted ? () => {} : onTransitionEnd}
      filterResponse={props.filterResponse}
      isPersisted={props.isPersisted}
      showActionBar={props.showActionBar}
      isCorrectivePopupEnabled={props.isCorrectivePopupEnabled}
      selectedFeedbackType={props.selectedFeedbackType}
      isFeedbackPending={props.isFeedbackPending}
      onFeedbackSubmit={props.onFeedbackSubmit}
    />
  );
};
