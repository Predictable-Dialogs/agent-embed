import type { KeyToken, KeyCombo, Keymap, Shortcuts } from '@/schemas/features/blocks/inputs/text'

/**
 * Matches a keyboard event against a specific key combination
 * Only triggers on Enter-based shortcuts and requires exact modifier matches
 */
export function matchCombo(evt: KeyboardEvent, combo: KeyCombo): boolean {
  // Only handle Enter-based shortcuts
  if (!combo.includes('Enter') || evt.key !== 'Enter') return false
  
  // Build set of currently pressed modifiers
  const pressed = new Set<KeyToken>()
  if (evt.shiftKey) pressed.add('Shift')
  if (evt.altKey) pressed.add('Alt')
  if (evt.metaKey || evt.ctrlKey) pressed.add('Mod')
  
  // Build set of expected modifiers (excluding Enter)
  const expected = new Set(combo.filter(k => k !== 'Enter'))
  
  // Exact match required - no extra modifiers allowed
  if (pressed.size !== expected.size) return false
  
  // Check that all pressed modifiers are expected
  for (const key of pressed) {
    if (!expected.has(key)) return false
  }
  
  return true
}

/**
 * Checks if AltGraph is pressed (to avoid conflicts with international keyboards)
 */
export function isAltGraph(evt: KeyboardEvent): boolean {
  return typeof evt.getModifierState === 'function' && evt.getModifierState('AltGraph')
}

/**
 * Checks if this is an Enter key press (including numpad)
 */
export function isEnter(evt: KeyboardEvent): boolean {
  return evt.key === 'Enter' || evt.code === 'NumpadEnter'
}

/**
 * Checks if Mod key is pressed (Cmd on Mac, Ctrl elsewhere)
 * Excludes AltGraph to avoid conflicts with international layouts
 */
export function isMod(evt: KeyboardEvent): boolean {
  if (isAltGraph(evt)) return false
  return evt.metaKey || evt.ctrlKey
}

/**
 * Resolves preset shortcuts to their corresponding keymaps
 */
export function resolvePresetToKeymap(preset: Shortcuts['preset']): Keymap {
  switch (preset) {
    case 'enterToSend':
      return {
        submit: [['Enter']],
        newline: [['Shift', 'Enter']]
      }
    case 'modEnterToSend':
      return {
        submit: [['Mod', 'Enter']],
        newline: [['Enter']]
      }
    case 'custom':
      // Custom requires explicit keymap - this is just a fallback
      return {
        submit: [['Enter']],
        newline: [['Shift', 'Enter']]
      }
    default:
      // Fallback to enterToSend
      return {
        submit: [['Enter']],
        newline: [['Shift', 'Enter']]
      }
  }
}

/**
 * Resolves shortcuts configuration to a final keymap
 * Handles presets, custom keymaps, and fallbacks
 */
export function resolveShortcutsToKeymap(shortcuts?: Shortcuts): Keymap {
  if (!shortcuts) {
    // No configuration - use default enterToSend
    return resolvePresetToKeymap('enterToSend')
  }
  
  if (shortcuts.preset === 'custom') {
    if (!shortcuts.keymap) {
      // Custom preset but no keymap - fallback to enterToSend
      return resolvePresetToKeymap('enterToSend')
    }
    return shortcuts.keymap
  }
  
  // Use preset
  return resolvePresetToKeymap(shortcuts.preset)
}

/**
 * Creates default shortcuts configuration
 */
export function createDefaultShortcuts(): Shortcuts {
  return {
    preset: 'enterToSend',
    imeSafe: true
  }
}