import { isMobile } from '@/utils/isMobileSignal'
import { createEffect, onMount, splitProps } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import type { Shortcuts } from '@/schemas/features/blocks/inputs/text'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

type AutoResizingTextareaProps = {
  ref: HTMLTextAreaElement | undefined
  onInput: (e: Event) => void
  shortcuts?: Shortcuts
  onSubmit?: () => void
  onNewline?: () => void
} & Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onInput'>

export const AutoResizingTextarea = (props: AutoResizingTextareaProps) => {
  const [local, others] = splitProps(props, ['ref', 'onInput', 'value', 'shortcuts', 'onSubmit', 'onNewline', 'onKeyDown'])
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

  const insertNewlineAtCaret = () => {
    if (!textareaRef) return
    
    const start = textareaRef.selectionStart
    const end = textareaRef.selectionEnd
    const value = textareaRef.value
    
    // Insert newline at cursor position
    const newValue = value.slice(0, start) + '\n' + value.slice(end)
    textareaRef.value = newValue
    
    // Move cursor after the newline
    const newCursorPos = start + 1
    textareaRef.setSelectionRange(newCursorPos, newCursorPos)
    
    // Trigger input event to update parent component
    const inputEvent = new Event('input', { bubbles: true })
    textareaRef.dispatchEvent(inputEvent)
    
    adjustHeight()
  }

  // Set up keyboard shortcuts
  const keyboardHandlers = useKeyboardShortcuts({
    shortcuts: local.shortcuts,
    onSubmit: () => local.onSubmit?.(),
    onNewline: () => {
      insertNewlineAtCaret()
      local.onNewline?.()
    },
  })

  // Combined onKeyDown handler that calls both shortcuts and additional handlers
  const handleKeyDown = (e: KeyboardEvent) => {
    // Call shortcut handler first
    keyboardHandlers.onKeyDown(e)
    // Then call any additional onKeyDown handler if provided
    if (local.onKeyDown) {
      local.onKeyDown(e)
    }
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
      onKeyDown={handleKeyDown}
      onCompositionStart={keyboardHandlers.onCompositionStart}
      onCompositionEnd={keyboardHandlers.onCompositionEnd}
      value={local.value}
      {...others}
    />
  )
}