import { CopyIcon, ThumbsDownIcon, ThumbsUpIcon } from '@/components/icons'
import type { FeedbackType } from '@/queries/sendFeedbackQuery'

type Props = {
  selectedFeedbackType?: FeedbackType
  isFeedbackPending?: boolean
  isCopied: boolean
  onThumbsUp: () => void | Promise<void>
  onThumbsDown: () => void | Promise<void>
  onCopy: () => void | Promise<void>
}

export const MessageActionBar = (props: Props) => {
  return (
    <div class="agent-message-action-bar">
      <button
        type="button"
        class="agent-message-action-button"
        classList={{ selected: props.selectedFeedbackType === 'positive' }}
        aria-label="Thumbs up"
        title="Thumbs up"
        onClick={props.onThumbsUp}
        disabled={props.isFeedbackPending}
      >
        <ThumbsUpIcon />
      </button>
      <button
        type="button"
        class="agent-message-action-button"
        classList={{ selected: props.selectedFeedbackType === 'negative' }}
        aria-label="Thumbs down"
        title="Thumbs down"
        onClick={props.onThumbsDown}
        disabled={props.isFeedbackPending}
      >
        <ThumbsDownIcon />
      </button>
      <button
        type="button"
        class="agent-message-action-button"
        classList={{ selected: props.isCopied }}
        aria-label="Copy message"
        title={props.isCopied ? 'Copied' : 'Copy'}
        onClick={props.onCopy}
      >
        <CopyIcon />
      </button>
    </div>
  )
}
