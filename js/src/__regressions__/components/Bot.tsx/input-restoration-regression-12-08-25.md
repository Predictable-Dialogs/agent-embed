# Bot.tsx Input Restoration Regression Analysis

**Date**: December 8, 2025  
**Severity**: High - User Experience Impact  
**Component**: `@js/src/components/Bot.tsx`  
**Issue**: Input not shown when `persistSession=true` and persisted messages exist

## Problem Description

When a user returns to a chat session where:
1. `props.persistSession` is `true`  
2. There are persisted messages in localStorage  

The input field does not render in `StreamInput.tsx`, preventing users from continuing the conversation.

## Root Cause Analysis

### The Regression Location
**File**: `@js/src/components/Bot.tsx`  
**Line**: 106  
**Problem**: Hardcoded `input: null` in session restoration

```typescript
// CURRENT BUGGY CODE (Bot.tsx:100-107)
const restoredData = {
  sessionId: storedSessionId,
  agentConfig: storedAgentConfig,
  theme: { customCss: storedCustomCss || '' },
  messages: [],
  clientSideActions: [],
  input: null,  // ❌ BUG: Should restore actual input data
};
```

### Comparison: Old vs New Implementation

#### OLD Code (Working)
The previous implementation properly preserved input during session restoration:

```typescript
// OLD: Properly stored and restored input
if (data.input) setInitialInput(data.input);

// Later passed to StreamConversation
initialAgentReply={{
  messages: initialMessages(),
  clientSideActions: clientSideActions(),
  input: initialInput(),  // ✅ Actual input data
}}
```

#### NEW Code (Broken) 
The refactored code hardcodes input to null during restoration:

```typescript
// NEW: Hardcodes input to null during session restoration
const restoredData = {
  // ... other data
  input: null,  // ❌ Always null, never restored
};
```

### Why the Input Disappears

1. **Condition in ChatChunk.tsx:79**: 
   ```typescript
   {props.input && (props.message.id === props.displayIndex) && (
     <StreamInput ... />
   )}
   ```

2. **Flow**:
   - Session restoration sets `input: null`
   - `mergedConfig().input` becomes `null` 
   - `ChatChunk` receives `input={null}` (for assistant messages)
   - Condition `props.input && ...` fails
   - `StreamInput` never renders

## Impact Assessment

- **User Experience**: Users cannot continue persisted conversations
- **Functionality**: Complete loss of input capability in restored sessions
- **Scope**: Affects all users with `persistSession=true` and existing chat history

## Fix Strategy

### 1. Update useAgentStorage Hook
Add input storage/retrieval capabilities:

```typescript
// Add to useAgentStorage.ts interface
interface UseAgentStorageReturn {
  getInput: () => any | null;
  setInput: (input: any) => void;
  // ... existing methods
}

// Implementation
const getInput = (): any | null => {
  const input = localStorage.getItem(getStorageKey('input'));
  return safeParse(input, null);
};

const setInput = (input: any): void => {
  localStorage.setItem(getStorageKey('input'), safeStringify(input));
};
```

### 2. Fix Bot.tsx Session Restoration
**Location**: `Bot.tsx:92-109`

```typescript
// BEFORE (broken)
const restoredData = {
  sessionId: storedSessionId,
  agentConfig: storedAgentConfig,
  theme: { customCss: storedCustomCss || '' },
  messages: [],
  clientSideActions: [],
  input: null,  // ❌ BUG
};

// AFTER (fixed)
const storedInput = storage.getInput();
const restoredData = {
  sessionId: storedSessionId,
  agentConfig: storedAgentConfig,
  theme: { customCss: storedCustomCss || '' },
  messages: [],
  clientSideActions: [],
  input: storedInput,  // ✅ Restore actual input
};
```

### 3. Store Input During API Initialization
**Location**: `Bot.tsx:73-75` (after API response)

```typescript
// After setApiData(data)
if (data.input) {
  // Store input for future session restoration
  storage.setInput(data.input);
}
```

### 4. Update Session Validation
**Location**: `useAgentStorage.ts:118-123`

Consider updating `hasCompleteSession()` to check for input:

```typescript
const hasCompleteSession = (): boolean => {
  const sessionId = getSessionId();
  const agentConfig = getAgentConfig(); 
  const messages = getChatMessages();
  // check for input - since it is critical for a session.
  // const input = getInput();
  return !!(sessionId && agentConfig && messages.length > 0);
};
```

## Prevention: Regression Tests

### Test Case 1: Basic Input Restoration
```typescript
it('should show input when persistSession=true and persisted messages exist', async () => {
  // Setup: persisted session with input data
  const testInput = { type: 'text', placeholder: 'Test input' };
  localStorage.setItem('test-agent_input', JSON.stringify(testInput));
  localStorage.setItem('test-agent_sessionId', JSON.stringify('session-123'));
  localStorage.setItem('test-agent_agentConfig', JSON.stringify(mockAgentConfig));
  localStorage.setItem('test-agent_chatMessages', JSON.stringify([
    { id: '1', role: 'assistant', content: 'Hello' }
  ]));

  render(() => (
    <Bot 
      agentName="test-agent" 
      persistSession={true} 
      stream={true}
    />
  ));

  // Verify: StreamConversation receives the input
  await waitFor(() => {
    expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
  });

  // Verify input was passed correctly (would need enhanced mock)
  expect(capturedStreamConversationProps.initialAgentReply.input).toEqual(testInput);
});
```

### Test Case 2: Input Storage During API Call
```typescript
it('should store input data from API response for future restoration', async () => {
  const apiInput = { type: 'text', placeholder: 'API input' };
  const mockApiResponse = createMockInitialChatReply({ input: apiInput });
  
  mockGetInitialChatReplyQuery.mockResolvedValue({ data: mockApiResponse });

  render(() => <Bot agentName="test-agent" />);

  await waitFor(() => {
    expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
  });

  // Verify input was stored in localStorage
  expect(localStorage.setItem).toHaveBeenCalledWith(
    'test-agent_input',
    JSON.stringify(apiInput)
  );
});
```

### Test Case 3: Input Precedence with Restoration
```typescript
it('should prioritize props.input over restored input', async () => {
  // Setup restored input in localStorage
  const restoredInput = { type: 'text', placeholder: 'Restored' };
  localStorage.setItem('test-agent_input', JSON.stringify(restoredInput));
  
  // Setup props input (should take precedence)
  const propsInput = { type: 'text', placeholder: 'Props' };

  render(() => (
    <Bot 
      agentName="test-agent"
      persistSession={true}
      stream={true}
      input={propsInput}  // Should override restored input
    />
  ));

  await waitFor(() => {
    expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
  });

  // Verify props input takes precedence
  expect(capturedStreamConversationProps.initialAgentReply.input).toEqual(propsInput);
});
```

## Implementation Checklist

- [ ] Add input storage methods to `useAgentStorage.ts`
- [ ] Fix session restoration in `Bot.tsx` (line 106)
- [ ] Add input storage during API initialization  
- [ ] Update `clearSession()` to remove input data
- [ ] Add comprehensive regression tests
- [ ] Verify fix works with both restored and fresh sessions
- [ ] Test input precedence logic (props vs restored vs API)

## Files to Modify

1. **`@js/src/hooks/useAgentStorage.ts`**
   - Add `getInput()` and `setInput()` methods
   - Update interface and implementation

2. **`@js/src/components/Bot.tsx`** 
   - Fix line 106: restore actual input instead of `null`
   - Store input data during API initialization

3. **`@js/src/__tests__/components/Bot/`**
   - Add regression tests for input restoration in a new file.
   - Test input storage and retrieval
   - Test precedence logic with restoration

## Risk Assessment

**Low Risk**: 
- Changes are isolated to storage/restoration logic
- Existing functionality preserved  
- No breaking API changes

**Testing Required**:
- Manual testing of session restoration
- Automated regression tests  
- Cross-browser localStorage compatibility

## Related Issues

This regression likely affects other components that rely on proper session restoration. Consider reviewing:
- `StreamConversation.tsx` - Input handling logic
- `ChatChunk.tsx` - Input rendering conditions  
- Other persistence-related functionality