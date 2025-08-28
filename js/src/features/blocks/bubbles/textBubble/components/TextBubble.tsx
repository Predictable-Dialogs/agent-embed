import { TypingBubble } from '@/components'
import type { TypingEmulation } from '@/schemas'
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { computeTypingDuration } from '../helpers/computeTypingDuration'
import { clsx } from 'clsx'
import { isMobile } from '@/utils/isMobileSignal'
import { applyFilterText } from '../helpers/applyFilterRichText'
import { PlateText } from './plate/PlateText'

type Props = {
  content: string
  typingEmulation: TypingEmulation
  onTransitionEnd: (offsetTop?: number) => void
  filterResponse?: (response: string) => string
  isPersisted?: boolean
}

export const showAnimationDuration = 400

const defaultTypingEmulation = {
  enabled: true,
  speed: 300,
  maxDelay: 1.5,
}

let typingTimeout: NodeJS.Timeout

export const TextBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  const [isTyping, setIsTyping] = createSignal(true)
  const [filteredText, setFilteredText] = createSignal(props.content)

  createEffect(async () => {
    const newText = applyFilterText(props.content, props.filterResponse);    
    setFilteredText(newText);
    
    // If content arrives and we're still typing, end the typing animation
    if (props.content?.trim() && isTyping()) {
      const typingDuration =
        props.typingEmulation?.enabled === false
          ? 0
          : computeTypingDuration(
              props.content,
              props.typingEmulation ?? defaultTypingEmulation
            )
      
      // Clear any existing timeout and set a new one
      if (typingTimeout) clearTimeout(typingTimeout)
      typingTimeout = setTimeout(onTypingEnd, typingDuration)
    }
  });
  
  const onTypingEnd = () => {
    if (!isTyping()) return
    setIsTyping(false)
    setTimeout(() => {
      props.onTransitionEnd(ref?.offsetTop)
    }, showAnimationDuration)
  }

  onMount(() => {
    if (!isTyping) return
    const typingDuration =
      props.typingEmulation?.enabled === false
        ? 0
        : computeTypingDuration(
            props.content,
            props.typingEmulation ?? defaultTypingEmulation
          )
    
    // If content is empty or only whitespace, keep typing animation until content arrives
    if (props.content?.trim()) {
      typingTimeout = setTimeout(onTypingEnd, typingDuration)
    }
    
    const newText = applyFilterText(props.content, props.filterResponse);    
    setFilteredText(newText);
  })

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout)
  })

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
            <PlateText content={filteredText()} />
          </div>
        </div>
      </div>
    </div>
  )
}