# Unit Test Plan for Bot.tsx - SessionId Functionality

## Test File Location
`js/src/__tests__/components/Bot.sessionId.test.tsx`

## Test Structure & Setup
- Framework: Vitest with @solidjs/testing-library
- Use existing test utilities and patterns from `test-utils.tsx`
- Mock basic components (StreamConversation, ErrorMessage, LiteBadge)

## Core SessionId Test Scenarios

### 4. Storage Key Namespacing Tests
**4.1 Agent-Specific Storage Keys**
- Test with different `agentName` values → Verify proper key prefixing
- Test with no `agentName` → Verify proper error thrown and no keys created.
- Assert: Storage keys follow pattern `${agentName}_${key}` vs plain `key`

**4.2 Storage Isolation Between Agents**
- Setup data for multiple agents in localStorage
- Initialize component with specific agentName → Only loads its own data
- Assert: Cross-agent data isolation maintained

### 1. New Session Generation Tests
**1.1 Fresh Start - No Persistence** - Approved
- When `persistSession=false` → Always calls API, gets new sessionId
- Assert: API called with `sessionId: undefined`, localStorage populated with returned sessionId

**1.2 Fresh Start - Persistence Enabled but No Storage** - Approved
- When `persistSession=true` but localStorage empty → Calls API, gets new sessionId
- Assert: API called, new sessionId stored with proper namespacing. Namespacing in `getStorageKey`

**1.3 Fresh Start - Persistence Enabled but Incomplete Storage** - Approved
- When `persistSession=true` but missing required data (sessionId OR agentConfig OR messages) → Calls API
- Test 4 scenarios: missing sessionId, missing agentConfig, missing messages, missing customCss
- Assert: API called for each incomplete scenario and data stored with proper namespacing. Namespacing in `getStorageKey`

### 2. Session Restoration Tests
**2.1 Complete Session Restoration** - Approved
- When `persistSession=true` AND `stream=true` AND all required storage exists → Skip API call
- Setup localStorage with complete data from `localStorage.md` 
- Assert: No API call, component initializes with stored data, StreamConversation receives persisted messages

### 3. Session Expiration & Recovery Tests
**3.1 Session Expiration Handling** - Approved
- Simulate session expiration via `onSessionExpired` callback. When session is persisted the localStorage would contain the agentConfig, chatMessages and sessionId named as per the namespacing in `getStorageKey`
- Assert: Storage cleared (sessionId + chatMessages + agentConfig), `persistedMessages` reset, `initializeBot` called after delay

**3.2 Session Recovery After Expiration** - Approved
- After session expiration, verify new session established
- Assert: New sessionId obtained, new data stored, component functional again

### 5. Effect-Based Persistence Tests
**5.1 Automatic Storage Updates** - Approved
- When API returns new sessionId → Verify automatically stored via createEffect
- When agentConfig changes → Verify automatically stored
- Assert: Each data change triggers corresponding localStorage.setItem

**5.2 Storage Update Ordering** - Rejected
- Test that effects run after API data arrives and component initializes
- Assert: Storage contains complete, consistent data after initialization

## Test Data Strategy
- Use realistic mock data. `getInitialChatReplyQuery.json` contants the API responses and `test-utils.tsx` contains test utilities and patterns.
- Use sample localStorage data from `localStorage.md` for restoration tests
- Create focused test data variants for specific scenarios (missing fields, invalid data)

## Assertion Strategy
- **Positive Tests**: Verify correct sessionId flows, proper storage operations, component state
- **Negative Tests**: Verify failure modes - missing data triggers API calls, invalid states handled
- **End-to-End**: Test complete flows from initial load through persistence to restoration
- **State Verification**: Check localStorage contents, component signals, prop passing to children

This plan ensures comprehensive coverage of all sessionId-related functionality while following the existing test patterns and using realistic test data.