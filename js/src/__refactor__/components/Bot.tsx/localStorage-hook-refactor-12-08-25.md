# Bot.tsx localStorage Hook Refactor Plan

**Date**: 2025-08-12  
**Type**: localStorage extraction refactor  
**Components**: Bot.tsx, StreamConversation.tsx  

## Overview
Refactor localStorage operations from `Bot.tsx` and `StreamConversation.tsx` into a reusable `useAgentStorage` hook to improve code maintainability and reduce duplication.

## Current State Analysis
- **Bot.tsx**: Contains localStorage read/write functions and session management logic
- **StreamConversation.tsx**: Has duplicate `getStorageKey()` function and writes chat messages
- **Duplication**: Both files implement similar localStorage patterns independently
- **Storage Keys**: sessionId, agentConfig, customCss, chatMessages, debugMode (all agent-namespaced except debugMode)

## Refactor Steps

### 1. Create the Hook
**File**: `js/src/hooks/useAgentStorage.ts`

**Hook Interface**:
```typescript
interface UseAgentStorageReturn {
  // Storage operations
  getSessionId: () => string | null;
  setSessionId: (sessionId: string) => void;
  getAgentConfig: () => any | null;
  setAgentConfig: (config: any) => void;
  getCustomCss: () => string | null;
  setCustomCss: (css: string) => void;
  getChatMessages: () => any[];
  setChatMessages: (messages: any[]) => void;
  getDebugMode: () => boolean;
  
  // Session management  
  clearSession: () => void;
  hasCompleteSession: () => boolean;
  
  // Storage key utilities
  getStorageKey: (key: string) => string;
}
```

**Features**: 
- Agent-namespaced storage keys (`${agentName}_${key}`)
- JSON serialization/deserialization with error handling
- SolidJS reactive patterns with signals/effects
- Session validation and cleanup utilities

### 2. Update Bot.tsx 

**Remove**:
- `getSessionId()`, `getAgentConfig()`, `getCustomCss()`, `getPersistedMessages()`, `checkDebugMode()`, `getStorageKey()`
- localStorage `createEffect()` blocks for sessionId/agentConfig/customCss (lines 144-165)
- `handleSessionExpired()` localStorage cleanup logic (lines 105-108)

**Replace with**:
```typescript
const storage = useAgentStorage(props.agentName);

// Session restoration logic becomes:
if (props.stream && props.persistSession && storage.hasCompleteSession()) {
  // Use storage.getSessionId(), storage.getAgentConfig(), etc.
}

// Session expiration becomes:
const handleSessionExpired = () => {
  storage.clearSession();
  setPersistedMessages([]);
  // ... rest of logic
};
```

**Key Changes**:
- Replace individual storage calls with hook methods
- Use `storage.hasCompleteSession()` for restoration conditions  
- Use `storage.clearSession()` for expiration cleanup
- Maintain exact same reactive behavior and component lifecycle

### 3. Update StreamConversation.tsx

**Remove**:
- `getStorageKey()` function (lines 100-102)
- chatMessages `createEffect()` localStorage write (lines 104-106)

**Replace with**:
```typescript
const storage = useAgentStorage(props.context.agentName);

// Message persistence becomes:
createEffect(() => {
  storage.setChatMessages(messages());
});
```

**Key Changes**:
- Remove duplicate storage key logic
- Use hook's `setChatMessages()` method
- Preserve all existing message persistence behavior

### 4. Hook Implementation Details

**Storage Key Logic**:
```typescript
const getStorageKey = (key: string) => {
  if (key === 'debugMode') return key; // Special case - not namespaced
  return agentName ? `${agentName}_${key}` : key;
};
```

**Session Validation**:
```typescript
const hasCompleteSession = () => {
  const sessionId = getSessionId();
  const agentConfig = getAgentConfig(); 
  const messages = getChatMessages();
  return sessionId && agentConfig && messages.length > 0;
};
```

**Error Handling**:
- Wrap JSON.parse/stringify in try-catch blocks
- Return null/default values on parse errors
- Log errors in development mode

### 5. Testing & Validation

**Unit Tests**: All tests in `js/src/__tests__/components/Bot/` must pass without changes
- `Bot.sessionId.test.tsx` - Session restoration, expiration, storage isolation
- `Bot.general.test.tsx` - Error states, initialization, branding
- `Bot.props.test.tsx` - Props precedence, integration, merging logic

**Test Coverage**:
- Session restoration with complete vs incomplete data
- Session expiration and cleanup
- Agent-specific storage key namespacing  
- Data isolation between different agents
- Error handling for malformed localStorage data
- Debug mode detection
- Props integration during session restoration

**Validation Steps**:
1. Run existing test suite - zero failures expected
2. Verify localStorage key patterns remain identical
3. Test session restoration logic works exactly as before
4. Confirm session expiration cleanup is complete
5. Validate agent namespace isolation still works

## Expected Benefits

**Code Quality**:
- **Reduced duplication**: Single source of truth for localStorage logic
- **Better maintainability**: Centralized storage operations  
- **Improved testability**: Hook can be tested independently
- **Cleaner components**: Bot.tsx and StreamConversation.tsx become more focused

**Functional**:
- **Zero breaking changes**: All existing behavior preserved exactly
- **Same performance**: No additional renders or effects
- **Consistent patterns**: Standardized storage operations across components

## Risk Mitigation

**API Compatibility**:
- Preserve exact same storage key naming and namespacing logic
- Maintain all session restoration condition checks
- Keep identical JSON serialization behavior
- Ensure storage cleanup covers same keys

**Reactive Behavior**:
- Maintain SolidJS reactive patterns and effect timing
- Preserve component lifecycle and initialization order
- Keep same error handling and fallback logic
- Maintain props precedence during session restoration

**Testing**:
- Run comprehensive test suite after each change
- Verify localStorage operations with realistic test data
- Test edge cases like session expiration and data corruption
- Validate multi-agent isolation scenarios

## RULES COMPLIANCE
- ✅ Unit tests in `js/src/__tests__/components/Bot` must not fail
- ✅ No functional changes to component behavior
- ✅ Improve readability and maintainability 
- ✅ No performance impact expected

## File Structure
```
js/src/
├── hooks/
│   └── useAgentStorage.ts          # New hook
├── components/
│   ├── Bot.tsx                     # Updated - remove localStorage code
│   └── StreamConversation/
│       └── StreamConversation.tsx  # Updated - remove localStorage code
└── __tests__/
    └── components/
        └── Bot/                    # All tests must pass
```

## Implementation Notes
- Create `js/src/hooks/` directory if it doesn't exist
- Follow SolidJS hook patterns (signals, effects, memos)
- Use TypeScript for proper type safety
- Add JSDoc comments for hook interface
- Consider adding hook-specific unit tests for comprehensive coverage. Do not modify/edit/delete existing tests. Tests to be created in a new file in the dir: `js/src/__tests__/components/Bot`