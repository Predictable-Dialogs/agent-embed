import { TypingBubble } from '@/components'
import type { FeedbackType } from '@/queries/sendFeedbackQuery'
import type { TypingEmulation } from '@/schemas'
import { Index, Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { clsx } from 'clsx'
import { isMobile } from '@/utils/isMobileSignal'
import { copyTextToClipboard } from '@/utils/copyTextToClipboard'
import type { ToolRenderer } from '@/types'
import { getToolUIData, getToolNameFromPart } from '@/utils/toolResults'
import { applyFilterText } from '../helpers/applyFilterRichText'
import { PlateText } from './plate/PlateText'
import { CorrectiveFeedbackPopup } from './CorrectiveFeedbackPopup'
import { MessageActionBar } from './MessageActionBar'
import { ToolUISlot } from './ToolUISlot'

type MessageLike = {
  id?: string
  parts?: Array<{ type?: string; text?: string }>
  content?: string
}

type Props = {
  message: MessageLike
  uiRenderers?: Record<string, ToolRenderer>
  onSubmitToolInput?: (toolCallId: string, result: { cancelled: boolean; values?: unknown }) => Promise<void>
  messageComplete?: boolean
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

type DisplayPart =
  | { type: 'text'; content: string }
  | { type: 'tool'; part: unknown; message?: string }

const getRequestInputMessage = (part: unknown): string | undefined => {
  const isInputRequestTool = (part as { toolMetadata?: { pdInteraction?: string } })
    ?.toolMetadata?.pdInteraction === 'request_user_input'
  if (!isInputRequestTool) return undefined

  const ui = getToolUIData(part, true)
  if (ui?.source !== 'input' || !ui.data || typeof ui.data !== 'object') return undefined
  const message = (ui.data as { message?: unknown }).message
  return typeof message === 'string' ? message : undefined
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
  const displayParts = createMemo<DisplayPart[]>(() => {
    const parts = props.message.parts ?? []
    const result: DisplayPart[] = []
    let hasTextPart = false

    for (const part of parts) {
      if (part?.type === 'text' && typeof part.text === 'string') {
        hasTextPart = true
        result.push({ type: 'text', content: applyFilterText(part.text, props.filterResponse) })
      } else if (getToolNameFromPart(part)) {
        const rawMessage = getRequestInputMessage(part)
        const message = rawMessage ? applyFilterText(rawMessage, props.filterResponse) : undefined
        result.push({ type: 'tool', part, message: message?.trim() ? message : undefined })
      }
    }

    if (!hasTextPart && typeof props.message.content === 'string') {
      result.unshift({ type: 'text', content: applyFilterText(props.message.content, props.filterResponse) })
    }

    return result
  })
  const hasRenderableToolResult = createMemo(() => displayParts().some((part) => {
    if (part.type !== 'tool') return false
    const ui = getToolUIData(part.part, Boolean(
      (part.part as { toolMetadata?: { pdInteraction?: string } })?.toolMetadata?.pdInteraction === 'request_user_input'
    ))
    return ui?.source === 'input' || Boolean(ui && typeof props.uiRenderers?.[ui.toolName] === 'function')
  }))
  const hasVisibleContent = createMemo(() =>
    filteredTextParts().some((part) => part.trim().length > 0) || hasRenderableToolResult()
  )
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
    if (isTyping() && (hasVisibleContent() || props.messageComplete)) {
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
    setIsCorrectivePopupOpen(false)
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
      <Show when={hasVisibleContent() || isTyping()}>
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
                'mx-4 my-2 whitespace-pre-wrap slate-html-container relative agent-host-bubble agent-host-bubble-content',
                hasRenderableToolResult()
                  ? 'overflow-visible max-w-full min-w-0'
                  : 'overflow-hidden text-ellipsis',
                isTyping() ? 'opacity-0' : 'opacity-100',
                props.isPersisted ? '' : ' text-fade-in'
              )}
              style={{
                'min-height': isMobile() ? '16px' : '20px',
                height: isTyping() ? (isMobile() ? '16px' : '20px') : 'auto',
                transition: 'height 350ms ease-out',
              }}
            >
              <Index each={displayParts()}>
                {(part) => (
                  <Show
                    when={part().type === 'text'}
                    fallback={
                      <>
                        <Show when={(part() as Extract<DisplayPart, { type: 'tool' }>).message}>
                          <div class="mb-2">
                            <PlateText content={(part() as Extract<DisplayPart, { type: 'tool' }>).message ?? ''} />
                          </div>
                        </Show>
                        <ToolUISlot
                          part={(part() as Extract<DisplayPart, { type: 'tool' }>).part}
                          pendingStatus={((part() as Extract<DisplayPart, { type: 'tool' }>).part as { toolMetadata?: { pdInteraction?: string }; toolCallId?: string })?.toolMetadata?.pdInteraction === 'request_user_input'
                            ? props.messageComplete ? 'ready' : 'detected'
                            : undefined}
                          uiRenderers={props.uiRenderers}
                          onSubmit={props.onSubmitToolInput}
                        />
                      </>
                    }
                  >
                    <PlateText content={(part() as Extract<DisplayPart, { type: 'text' }>).content} />
                  </Show>
                )}
              </Index>
            </div>
          </div>
        </div>
      </Show>
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
