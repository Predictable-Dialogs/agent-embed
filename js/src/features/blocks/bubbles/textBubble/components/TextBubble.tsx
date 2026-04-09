import { TypingBubble } from '@/components'
import type { FeedbackType } from '@/queries/sendFeedbackQuery'
import type { TypingEmulation } from '@/schemas'
import { For, Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { clsx } from 'clsx'
import { isMobile } from '@/utils/isMobileSignal'
import { copyTextToClipboard } from '@/utils/copyTextToClipboard'
import { applyFilterText } from '../helpers/applyFilterRichText'
import { PlateText } from './plate/PlateText'
import { CorrectiveFeedbackPopup } from './CorrectiveFeedbackPopup'
import { MessageActionBar } from './MessageActionBar'

type MessageLike = {
  id?: string
  parts?: Array<{ type?: string; text?: string }>
  content?: string
}

type Props = {
  message: MessageLike
  typingEmulation: TypingEmulation
  onTransitionEnd: (offsetTop?: number) => void
  filterResponse?: (response: string) => string
  isPersisted?: boolean
  showActionBar?: boolean
  isCorrectivePopupEnabled?: boolean
  selectedFeedbackType?: FeedbackType
  isFeedbackPending?: boolean
  onFeedbackSubmit?: (payload: {
    messageId: string
    type: FeedbackType
    correctiveAnswer?: string
  }) => void | Promise<void>
}

export const showAnimationDuration = 400

export const TextBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  let correctivePopupRef: HTMLDivElement | undefined
  const [isTyping, setIsTyping] = createSignal(true)
  const [isCopied, setIsCopied] = createSignal(false)
  const [isCorrectivePopupOpen, setIsCorrectivePopupOpen] = createSignal(false)
  const [correctiveAnswer, setCorrectiveAnswer] = createSignal('')
  let copiedStateTimeout: ReturnType<typeof setTimeout> | undefined
  let wasCorrectivePopupOpen = false

  const textParts = createMemo(() => {
    const parts = props.message.parts ?? []
    const texts = parts.filter((p): p is { type?: string; text: string } => p?.type === 'text' && typeof p.text === 'string')

    if (texts.length > 0) return texts

    if (typeof props.message.content === 'string') {
      return [{ type: 'text', text: props.message.content }]
    }

    return []
  })

  const filteredTextParts = createMemo(() => textParts().map(part => applyFilterText(part.text, props.filterResponse)))
  const messageText = createMemo(() => filteredTextParts().filter(part => part.trim().length > 0).join('\n\n'))
  const canShowActionBar = createMemo(() => {
    return (
      Boolean(props.showActionBar) &&
      !isTyping() &&
      typeof props.message.id === 'string' &&
      props.message.id.trim().length > 0 &&
      messageText().trim().length > 0
    )
  })

  createEffect(() => {
    const hasText = filteredTextParts().some(part => part.trim())
    if (isTyping() && hasText) {
      onTypingEnd()
    }
  })

  createEffect(() => {
    const isPopupOpen = canShowActionBar() && isCorrectivePopupOpen()
    if (isPopupOpen && !wasCorrectivePopupOpen) {
      requestAnimationFrame(() => {
        correctivePopupRef?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest',
        })
      })
    }

    wasCorrectivePopupOpen = isPopupOpen
  })

  const onTypingEnd = () => {
    if (!isTyping()) return
    setIsTyping(false)
    setTimeout(() => {
      props.onTransitionEnd(ref?.offsetTop)
    }, showAnimationDuration)
  }

  const submitFeedback = async (type: FeedbackType, corrective?: string) => {
    const messageId = props.message.id
    if (!messageId || typeof props.onFeedbackSubmit !== 'function') {
      return
    }
    await props.onFeedbackSubmit({
      messageId,
      type,
      ...(typeof corrective === 'string' ? { correctiveAnswer: corrective } : {}),
    })
  }

  const handleThumbsUp = async () => {
    if (props.isFeedbackPending) return
    await submitFeedback('positive')
  }

  const handleThumbsDown = async () => {
    if (props.isFeedbackPending) return
    if (props.isCorrectivePopupEnabled) {
      setIsCorrectivePopupOpen(true)
      return
    }
    await submitFeedback('negative')
  }

  const handleSubmitCorrectiveFeedback = async () => {
    if (props.isFeedbackPending) return
    const answer = correctiveAnswer().trim()
    await submitFeedback('negative', answer)
    setIsCorrectivePopupOpen(false)
    setCorrectiveAnswer('')
  }

  const handleSkipCorrectiveFeedback = async () => {
    if (props.isFeedbackPending) return
    await submitFeedback('negative')
    setIsCorrectivePopupOpen(false)
    setCorrectiveAnswer('')
  }

  const handleCopy = async () => {
    const textToCopy = messageText()
    if (!textToCopy) {
      return
    }

    const wasCopied = await copyTextToClipboard(textToCopy)
    if (!wasCopied) {
      setIsCopied(false)
      return
    }

    setIsCopied(true)
    if (copiedStateTimeout) {
      clearTimeout(copiedStateTimeout)
    }
    copiedStateTimeout = setTimeout(() => {
      setIsCopied(false)
    }, 1600)
  }

  onCleanup(() => {
    if (copiedStateTimeout) {
      clearTimeout(copiedStateTimeout)
    }
  })

  return (
    <div
      class={"flex flex-col" + (props.isPersisted ? '' : ' animate-fade-in')}
      ref={ref}
    >
      <div class="flex w-full items-center">
        <div
          class="flex relative items-start agent-host-bubble-wrapper"
        >
          <div
            class={clsx(
              "flex items-center absolute px-4 py-2 bubble-typing agent-host-bubble",
              props.isPersisted && "no-transition"
            )}
            style={{
              width: isTyping() ? '64px' : '100%',
              height: '100%',
            }}
            data-testid="host-bubble"
          >
            {isTyping() && <TypingBubble />}
          </div>
          <div
            class={clsx(
              'overflow-hidden mx-4 my-2 whitespace-pre-wrap slate-html-container relative text-ellipsis agent-host-bubble agent-host-bubble-content',
              isTyping() ? 'opacity-0' : 'opacity-100',
              props.isPersisted ? '' : ' text-fade-in'
            )}
            style={{
              'min-height': isMobile() ? '16px' : '20px',
              height: isTyping() ? (isMobile() ? '16px' : '20px') : 'auto',
              transition: 'height 350ms ease-out',
            }}
          >
            <For each={filteredTextParts()}>
              {text => <PlateText content={text} />}
            </For>
          </div>
        </div>
      </div>
      <Show when={canShowActionBar()}>
        <MessageActionBar
          selectedFeedbackType={props.selectedFeedbackType}
          isFeedbackPending={props.isFeedbackPending}
          isCopied={isCopied()}
          onThumbsUp={handleThumbsUp}
          onThumbsDown={handleThumbsDown}
          onCopy={handleCopy}
        />
      </Show>
      <Show when={canShowActionBar() && isCorrectivePopupOpen()}>
        <div
          ref={correctivePopupRef}
          style={{ 'scroll-margin-bottom': 'calc(var(--space-safe-bottom) + 8rem)' }}
        >
          <CorrectiveFeedbackPopup
            inputId={`feedback-corrective-${props.message.id}`}
            correctiveAnswer={correctiveAnswer()}
            isFeedbackPending={props.isFeedbackPending}
            onCorrectiveAnswerChange={setCorrectiveAnswer}
            onSkip={handleSkipCorrectiveFeedback}
            onSubmit={handleSubmitCorrectiveFeedback}
          />
        </div>
      </Show>
    </div>
  )
}
