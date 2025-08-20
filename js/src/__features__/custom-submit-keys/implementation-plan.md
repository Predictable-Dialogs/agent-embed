# Custom Submit Keys Implementation Plan

## Overview
Add configurable keyboard shortcuts for the AutoResizingTextarea component, supporting three modes: `enterToSend` (default), `modEnterToSend`, and `custom` with user-defined keymaps.

## Files to Create/Modify

### 1. **Type Definitions & Schema Updates**
- **`js/src/schemas/features/blocks/inputs/text.ts`**
  - Add `shortcuts` object schema with `preset`, `keymap`, and `imeSafe` properties
  - Support for `enterToSend`, `modEnterToSend`, and `custom` presets
  - Define schema for custom keymap with `submit` and `newline` action arrays

### 2. **Utility Functions**
- **`js/src/utils/keyboardUtils.ts`** (new file)
  - `matchCombo()` function for exact key combination matching
  - Preset resolution functions to convert presets to keymap objects
  - Helper functions for modifier key detection (Mod, IME safety, etc.)

### 3. **Custom Hook**
- **`js/src/hooks/useKeyboardShortcuts.ts`** (new file)
  - Manage keyboard event handling logic
  - Handle composition events for IME safety
  - Process shortcuts configuration and resolve presets
  - Return keyboard event handlers for components to use

### 4. **Component Updates**
- **`js/src/components/inputs/AutoResizingTextarea.tsx`**
  - Add `shortcuts` prop to component interface
  - Integrate useKeyboardShortcuts hook
  - Add composition event listeners
  - Replace onKeyDown with shortcut-aware keyboard handling

- **`js/src/components/StreamConversation/FixedBottomInput.tsx`**
  - Remove hardcoded `submitWhenEnter` and `submitIfCtrlEnter` functions
  - Pass shortcuts configuration from block options to AutoResizingTextarea
  - Update to use new shortcut system instead of manual key handling

### 5. **Configuration Updates**
- **`js/src/constants.ts`**
  - Update `defaultBotProps.input` with proper type and default shortcuts
  - Set default to `enterToSend` preset with `imeSafe: true`

### 6. **Type System Integration**
- **`js/src/components/Bot.tsx`**
  - Update `BotProps.input` type from `any` to proper typed interface
  - Ensure shortcuts configuration flows through to components

## Implementation Strategy

### Phase 1: Foundation
1. Create keyboard utility functions with exact matching logic
2. Define comprehensive type schemas for shortcuts configuration
3. Implement useKeyboardShortcuts hook with composition handling

### Phase 2: Integration
1. Update AutoResizingTextarea to use new shortcut system
2. Modify FixedBottomInput to pass configuration and remove hardcoded logic
3. Update constants and type definitions

### Phase 3: Testing & Validation
1. Test all three preset modes (enterToSend, modEnterToSend, custom)
2. Verify IME safety with composition events
3. Ensure exact key matching (no extra modifiers)
4. Validate fallback behavior for invalid configurations

## Key Design Principles

- **Separation of Concerns**: Keep AutoResizingTextarea clean by delegating logic to hooks/utilities
- **Backward Compatibility**: Default behavior remains Enter-to-send with Shift+Enter for newlines
- **IME Safety**: Respect composition events to avoid conflicts with international input methods
- **Exact Matching**: Only trigger on precise key combinations, reject extra modifiers
- **Fallback Handling**: Gracefully handle invalid configurations by falling back to default

## Configuration Examples

The implementation will support these configuration formats:

```json
// Default (enterToSend)
{ "shortcuts": { "preset": "enterToSend", "imeSafe": true } }

// Mod+Enter to send
{ "shortcuts": { "preset": "modEnterToSend", "imeSafe": true } }

// Custom keymaps
{ 
  "shortcuts": { 
    "preset": "custom",
    "keymap": {
      "submit": [["Mod","Enter"], ["Shift","Enter"]],
      "newline": [["Enter"]]
    },
    "imeSafe": true
  }
}
```