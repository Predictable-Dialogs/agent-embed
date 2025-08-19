import { isMobile } from '@/utils/isMobileSignal'
import { createEffect, onMount, splitProps } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'

type AutoResizingTextareaProps = {
  ref: HTMLTextAreaElement | undefined
  onInput: (e: Event) => void
} & Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onInput'>

export const AutoResizingTextarea = (props: AutoResizingTextareaProps) => {
  const [local, others] = splitProps(props, ['ref', 'onInput', 'value'])
  let textareaRef: HTMLTextAreaElement | undefined

  const adjustHeight = () => {
    if (!textareaRef) return
    
    // Reset height to calculate scrollHeight properly
    textareaRef.style.height = 'auto'
    
    // Calculate line height (assuming 1.5em line height)
    const computedStyle = window.getComputedStyle(textareaRef)
    const fontSize = parseFloat(computedStyle.fontSize)
    const lineHeight = fontSize * 1.5
    
    // Get max lines from CSS variable - check document root for the variable
    const maxLines = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--input-max-lines') || '11'
    )
    
    // Calculate heights
    const minHeight = lineHeight // 1 line
    const maxHeight = lineHeight * maxLines // max lines
    const scrollHeight = textareaRef.scrollHeight
    
    // Set the height based on content, but constrain to min/max
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
    textareaRef.style.height = `${newHeight}px`
    
    // Show scrollbar only when content exceeds max height
    if (scrollHeight > maxHeight) {
      textareaRef.style.overflowY = 'auto'
      // Add padding to account for scrollbar so text doesn't get cut off
      textareaRef.style.paddingRight = '20px'
    } else {
      textareaRef.style.overflowY = 'hidden'
      textareaRef.style.paddingRight = '16px' // Original padding from px-4
    }
  }

  // Set initial ref and adjust height on mount
  onMount(() => {
    adjustHeight()
  })

  // Adjust height when value changes
  createEffect(() => {
    local.value // Track value changes
    adjustHeight()
  })

  const handleInput = (e: Event) => {
    local.onInput(e)
    adjustHeight()
  }

  return (
    <textarea
      ref={(el) => {
        textareaRef = el
        // Forward the ref to the parent component using the original props.ref
        if (typeof props.ref === 'function') {
          props.ref(el)
        } else if (props.ref) {
          props.ref = el
        }
      }}
      class="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input resize-none"
      data-testid="auto-resizing-textarea"
      required
      style={{ 
        'font-size': '16px',
        'line-height': '1.5',
        'overflow-y': 'hidden'
      }}
      autofocus={!isMobile()}
      onInput={handleInput}
      value={local.value}
      {...others}
    />
  )
}