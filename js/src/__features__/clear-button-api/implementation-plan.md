# Clear Button API Implementation Plan

## Overview
Add a programmatic `reset` command to clear the current chat session, similar to the existing ClearButton functionality but accessible via the Agent API.

## Implementation Details

Following the **implementation rules** at `agent-embed/js/src/__rules__/implementation-rules.md`, this plan ensures:
- Improved readability and maintainability
- No performance impact
- Existing tests remain unchanged
- `npm run build` will verify the implementation

## Files to Modify/Create

### 1. Create Reset Command Utility
**File**: `js/src/features/commands/utils/reset.ts`
- Create new command utility following existing pattern from `close.ts`
- Command posts a message with `CommandData` containing `command: 'reset'`

### 2. Update Command Types
**File**: `js/src/features/commands/types.ts`
- Add `'reset'` to the command union type in `CommandData`
- No additional data needed for reset command

### 3. Export Reset Command
**File**: `js/src/features/commands/utils/index.ts`
- Add `export * from './reset'`

### 4. Add to Window Interface
**File**: `js/src/window.ts`
- Import `reset` from commands
- Add `reset` to Agent interface type definition
- Add `reset` to `parsePredictable()` return object
- This makes `window.Agent.reset()` available globally

### 5. Handle Reset Command in Bot Component (Centralized Approach)
**File**: `js/src/components/Bot.tsx`
- Add message event listener in the Bot component's `onMount` lifecycle
- Listen for `reset` command messages and call existing `handleClearSession` function
- This centralizes the reset handling since Bot.tsx is used by all widgets
- No need to modify individual widget components (Standard, Popup, Bubble)

### 6. Create Test Case (TDD Approach)
**File**: `js/src/__tests__/commands/reset.test.tsx`
- **Before implementation**: Test calls `window.Agent.reset()` and verifies localStorage data remains unchanged (test fails)
- **After implementation**: Same test verifies localStorage is cleared for the agentName (test passes)
- Use existing test utilities from `test-utils.tsx`
- Mock `getInitialChatReplyQuery` using existing patterns
- Test should verify specific localStorage keys are cleared:
  - `{agentName}_sessionId`
  - `{agentName}_chatMessages` 
  - `{agentName}_agentConfig`
  - `{agentName}_customCss`
  - `{agentName}_input`

## Test Strategy (TDD)

### Phase 1 - Create Failing Test
1. Create test that:
   - Sets up localStorage with agent data (using test data from `localStorage.md`)
   - Calls `window.Agent.reset()`
   - Verifies localStorage data is cleared
   - **Expected**: Test fails because reset command doesn't exist/work

### Phase 2 - Implementation
1. Implement all the above components
2. Run the same test
3. **Expected**: Test passes because localStorage is properly cleared

### Phase 3 - Verification
1. Run `npm run build` to check for type errors
2. Run existing tests to ensure no regressions
3. Verify the new test passes

## Key Technical Decisions

1. **Command Pattern**: Follow existing pattern used by `close`, `open`, `toggle` commands
2. **Storage Clearing**: Leverage existing `storage.clearSession()` method from `useAgentStorage` hook
3. **Widget Compatibility**: Ensure all three widget types (Standard, Popup, Bubble) support the command
4. **Error Handling**: Use existing error handling patterns from other commands
5. **Type Safety**: Maintain TypeScript compatibility throughout

## Success Criteria

- `window.Agent.reset()` successfully clears the chat session
- localStorage is properly cleared for the specific agent
- All widget types (Standard, Popup, Bubble) support the reset command  
- Existing functionality remains unaffected
- Test passes with TDD approach (fails before, passes after implementation)
- No TypeScript compilation errors