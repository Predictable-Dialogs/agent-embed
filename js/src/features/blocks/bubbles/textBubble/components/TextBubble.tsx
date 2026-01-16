import { TypingBubble } from '@/components'
import type { TypingEmulation } from '@/schemas'
import { For, createEffect, createMemo, createSignal } from 'solid-js'
import { clsx } from 'clsx'
import { isMobile } from '@/utils/isMobileSignal'
import { applyFilterText } from '../helpers/applyFilterRichText'
import { PlateText } from './plate/PlateText'

type MessageLike = {
  parts?: Array<{ type?: string; text?: string }>
  content?: string
}

type Props = {
  message: MessageLike
  typingEmulation: TypingEmulation
  onTransitionEnd: (offsetTop?: number) => void
  filterResponse?: (response: string) => string
  isPersisted?: boolean
}

export const showAnimationDuration = 400

export const TextBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  const [isTyping, setIsTyping] = createSignal(true)
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

  createEffect(() => {
    const hasText = filteredTextParts().some(part => part.trim())
    if (isTyping() && hasText) {
      onTypingEnd()
    }
  })
  
  const onTypingEnd = () => {
    if (!isTyping()) return
    setIsTyping(false)
    setTimeout(() => {
      props.onTransitionEnd(ref?.offsetTop)
    }, showAnimationDuration)
  }
  return (
    <div 
      class={"flex flex-col" + (props.isPersisted ? '' : ' animate-fade-in')} 
      ref={ref}
    >
      <div class="flex w-full items-center">
        <div 
          class="flex relative items-start agent-host-bubble"
        >
          <div
            class={clsx(
              "flex items-center absolute px-4 py-2 bubble-typing",
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
              'overflow-hidden mx-4 my-2 whitespace-pre-wrap slate-html-container relative text-ellipsis',
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
    </div>
  )
}
