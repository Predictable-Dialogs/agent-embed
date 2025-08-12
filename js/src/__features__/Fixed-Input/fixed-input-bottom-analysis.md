# Fixed Bottom Input Feature Analysis & Implementation Plan

## Current System Overview

Based on analysis of the codebase, the current input system works as follows:

### 1. File & Dependency Map

**Primary Components:**
- `js/src/components/Bot.tsx:13-25,36-37` - Main component that receives `input?: any` prop and merges with API data
- `js/src/components/StreamConversation/StreamConversation.tsx:45-243` - Manages chat flow and streaming handlers
- `js/src/components/StreamConversation/ChatChunk.tsx:30-92` - Renders messages and conditionally shows input via `displayIndex` matching
- `js/src/components/StreamConversation/StreamInput.tsx:22-64` - Input wrapper component
- `js/src/features/blocks/inputs/textInput/components/TextInput.tsx:19-111` - Core input logic with single/multi-line modes

**Supporting Components:**
- `js/src/components/inputs/ShortTextInput.tsx:9-22` - Single-line input element
- `js/src/components/inputs/Textarea.tsx:10-26` - Multi-line input element (6 rows)
- `js/src/schemas/features/blocks/inputs/text.ts:6-34` - TypeScript definitions for `TextInputBlock`

**Component Tree:**
```
Bot → StreamConversation → ChatChunk → StreamInput → TextInput
                                                   ├─ ShortTextInput (when !isLong)
                                                   └─ Textarea (when isLong)
```

### 2. Public API

**Current Input Configuration:**
```typescript
type BotProps = {
  input?: any; // TextInputBlock with options.isLong: boolean
}

type TextInputOptions = {
  isLong: boolean;
  labels: { button: string; placeholder: string; }
}
```

**Current Behavior:** Input type determined by `block.options.isLong`:
- `false`: Single-line with max-width 350px, Enter to submit
- `true`: Multi-line textarea (6 rows), Cmd/Ctrl+Enter to submit

### 3. Current State Management

**Display Logic:**
- Input only shows when `message.id === displayIndex` (StreamConversation.tsx:79)
- `displayIndex` set to `'#HIDE'` during streaming (StreamConversation.tsx:128)
- Input completely hidden during message streaming

**Key State Flows:**
```
Idle → User Types → Submit → displayIndex='#HIDE' → Streaming → Response Complete → displayIndex=messageId
```

### 4. Behavior & State

**Single-line vs Multi-line Mode Selection:**
- Determined by `props.block.options.isLong` in TextInput component (TextInput.tsx:81)
- API or props provide this value initially in Bot.tsx (Bot.tsx:36-37)
- Value merged via `mergePropsWithApiData` function (Bot.tsx:37)

**Input Validation & Submission:**
- Validation: `inputValue() !== '' && inputRef?.reportValidity()` (TextInput.tsx:32-33)
- Single-line: Enter key submits (TextInput.tsx:48-49)
- Multi-line: Cmd/Ctrl+Enter submits (TextInput.tsx:52-54)

### 5. Styling & Layout

**Key Tailwind Classes:**
- Container: `flex items-end justify-between pr-2 agent-input w-full` (TextInput.tsx:74)
- Input elements: `focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input` (Textarea.tsx:16, ShortTextInput.tsx:15)
- Max-width constraint: `max-width: 350px` for single-line only (TextInput.tsx:77)

**Positioning Logic:**
- StreamInput uses `flex justify-end animate-fade-in gap-2` (StreamInput.tsx:25)
- Relative positioning within chat flow
- Avatar spacing handled with padding/margins (StreamInput.tsx:30-33)

### 6. Accessibility & UX

**Focus Management:**
- Auto-focus on desktop: `if (!isMobile() && inputRef) inputRef.focus()` (TextInput.tsx:58)
- Tab order follows natural DOM flow

**Keyboard Behaviors:**
- Single-line: Enter submits, no Shift+Enter handling
- Multi-line: Cmd/Ctrl+Enter submits, Enter creates new line
- Font-size set to 16px to prevent iOS zoom (TextInput.tsx:20, Textarea.tsx:20)

**ARIA & Labels:**
- Placeholder text provided via `block.options.labels.placeholder` (TextInput.tsx:87, 97)
- Required attribute on textarea (Textarea.tsx:19)
- Test IDs: `data-testid="input"` and `data-testid="textarea"` (TextInput.tsx:75, Textarea.tsx:18)

### 7. Side Effects & Integrations

**Submission Flow:**
- Streaming handlers: `streamingHandlers?.onSubmit(event)` (TextInput.tsx:41)
- Falls back to `props.onSubmit({ value: inputValue() })` (TextInput.tsx:43)
- Form reset after submission in StreamConversation.tsx:137-140

**Global Event Listeners:**
- Window message listener for commands: `window.addEventListener('message', processIncomingEvent)` (TextInput.tsx:59)
- Command handling: `setInputValue` command support (TextInput.tsx:69)

**File Attachments:**
- Experimental attachments via `{ experimental_attachments: files() }` (StreamConversation.tsx:133)
- File input ref management (StreamConversation.tsx:57, 138-140)

### 8. Extension Points & Constraints

**Minimum Changes for Fixed Bottom Input:**

1. **Schema Extension** (`js/src/schemas/features/blocks/inputs/text.ts:13-19`):
   ```typescript
   textInputOptionsSchema.merge(z.object({
     type: z.enum(['standard', 'fixed-bottom']).optional()
   }))
   ```

2. **Conditional Rendering** (`js/src/components/StreamConversation/ChatChunk.tsx:79-89`):
   ```typescript
   {props.input && props.input.options?.type !== 'fixed-bottom' && 
    (props.message.id === props.displayIndex) && (
     <StreamInput ... />
   )}
   ```

3. **Fixed Input Container** (new component in StreamConversation.tsx):
   ```typescript
   {props.initialAgentReply.input?.options?.type === 'fixed-bottom' && (
     <FixedBottomInput ... />
   )}
   ```

**Key Constraints:**
- Container expects to fill width (TextInput.tsx:74)
- Avatar spacing assumptions (StreamInput.tsx:29-33)
- Display index logic tightly coupled to message flow

**Mobile Risks:**
- iOS Safari viewport units (`100vh` issues with virtual keyboard)
- Safe-area insets for modern phones
- Virtual keyboard overlap
- Touch target sizes below 44px

### 9. State Machine Sketch

**Current Flow:**
```
Idle → Typing → Submit → Hidden → Streaming → Response Complete → Show Input
  ↑                        ↓
  └── (displayIndex = messageId) ←── (displayIndex = '#HIDE')
```

**New Fixed-Bottom Flow:**
```
Idle → Typing → Submit → Disabled → Streaming → Response Complete → Enabled
  ↑                        ↓                                        ↓
  └── (input enabled) ←─── (submit disabled) ←──────────────────────┘
```

**Triggers:**
- `status() === 'ready'` enables input (StreamConversation.tsx:108)
- Assistant message arrival re-enables submit (StreamConversation.tsx:208-211)
- `longRequest` timer shows loading after 2s (StreamConversation.tsx:129-131)

### 10. More details

**Layout:**
- fixed input is at the bottom of the screen and hence the max-width constraint is not applicable. The image shows how this would look.
- The avatar spacing can remain as is, unless there is a better way to handle it.
- The z-index layer should be such that when the text scrolls it is below the input.

**Behavior:**
- We do not support file attachments or other selectors on the input.
- The typing indicators can work how they do now or can be improved, without changing the behaviour for existing input

** Clarifications:**
- The fixed bottom input should be compatible with all three widgets i.e. bubble, standard, popup

### 11. High Level Implementation Strategy

The implementation should be such that, it does not affect the existing inputs.

**Phase 1: Schema & Props (Low Risk)**
1. Extend TextInputOptions type
2. Update Bot.tsx prop merging
3. Add backward compatibility defaults

**Phase 2: Rendering Logic (Medium Risk)**
1. Create FixedBottomInput component
2. Modify ChatChunk conditional rendering
3. Update StreamConversation layout

**Phase 3: Styling & Mobile (High Risk)**
1. Implement fixed positioning CSS
2. Add safe-area and keyboard handling

**Rollback Plan:**
- Feature flag to disable/prevent fixed-bottom mode
