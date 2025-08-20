import { createSignal, onCleanup } from 'solid-js'
import type { Shortcuts } from '@/schemas/features/blocks/inputs/text'
import { matchCombo, resolveShortcutsToKeymap } from '@/utils/keyboardUtils'

interface UseKeyboardShortcutsProps {
  shortcuts?: Shortcuts
  onSubmit: () => void
  onNewline: () => void
}

interface KeyboardShortcutHandlers {
  onKeyDown: (e: KeyboardEvent) => void
  onCompositionStart: () => void
  onCompositionEnd: () => void
}

/**
 * Hook to handle keyboard shortcuts for text input with IME safety
 */
export function useKeyboardShortcuts(props: UseKeyboardShortcutsProps): KeyboardShortcutHandlers {
  const [isComposing, setIsComposing] = createSignal(false)
  
  // Resolve shortcuts configuration to keymap
  const keymap = resolveShortcutsToKeymap(props.shortcuts)
  const imeSafe = props.shortcuts?.imeSafe ?? true
  
  const handleKeyDown = (e: KeyboardEvent) => {
    // Skip if IME is composing and IME safety is enabled
    if (imeSafe && (isComposing() || (e as any).isComposing)) {
      return
    }
    
    // Try submit combinations first
    for (const combo of keymap.submit) {
      if (matchCombo(e, combo)) {
        e.preventDefault()
        props.onSubmit()
        return
      }
    }
    
    // Try newline combinations
    for (const combo of keymap.newline) {
      if (matchCombo(e, combo)) {
        e.preventDefault()
        props.onNewline()
        return
      }
    }
    
    // No shortcuts matched - allow normal typing
  }
  
  const handleCompositionStart = () => {
    setIsComposing(true)
  }
  
  const handleCompositionEnd = () => {
    setIsComposing(false)
  }
  
  return {
    onKeyDown: handleKeyDown,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
  }
}