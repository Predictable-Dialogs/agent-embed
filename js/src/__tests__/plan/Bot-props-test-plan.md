# Unit Test Plan for Bot.tsx - Props Integration & Merging Logic

## Test File Location
`js/src/__tests__/components/Bot.props.test.tsx`

## Overview
This plan covers props integration testing and merging logic for the Bot component, complementing the existing sessionId test plan. Focus areas include props precedence, component integration, error handling, and reactive updates.

## Test Structure & Setup
- Framework: Vitest with @solidjs/testing-library
- Use existing test utilities and patterns from `test-utils.tsx`
- Mock external dependencies (getInitialChatReplyQuery) but test real component behavior
- Use realistic test data from `getInitialChatReplyQuery.json` and `localStorage.md`

## NEW TESTS - Props Integration & Merging Logic

### 1. Props Input Precedence Tests (Core Requirement)

**1.1 Props Input Takes Precedence Over API Input** - Approved
- **Setup:** Mock API to return `input: { type: "text input", options: { labels: { placeholder: "API placeholder" } } }`
- **Execute:** Render Bot with `props.input = { type: "custom input", options: { labels: { placeholder: "Props placeholder" } } }`
- **Assert:** BotContent receives `initialAgentReply.input` with props value, not API value
- **Critical:** Must fail if `mergePropsWithApiData` precedence logic breaks

**1.2 API Input Used When Props Input Undefined** - Approved
- **Setup:** Mock API to return realistic input from `getInitialChatReplyQuery.json`
- **Execute:** Render Bot without props.input
- **Assert:** BotContent receives `initialAgentReply.input` with API value
- **Critical:** Must fail if API fallback is broken

**1.3 Null Input When Both Sources Undefined** - Rejected
- **Setup:** Mock API to return data without input field
- **Execute:** Render Bot without props.input
- **Assert:** BotContent receives `initialAgentReply.input = null`
- **Critical:** Must fail if null handling in mergePropsWithApiData breaks

### 2. Component Integration & Props Passing Tests

**2.1 Complete Props Passing to BotContent** - Rejected
- **Setup:** Render Bot with complete props set (onAnswer, onEnd, filterResponse, stream, etc.)
- **Execute:** Wait for initialization
- **Assert:** 
  - BotContent receives correct `context` object with all API values
  - Callback props (onAnswer, onEnd, filterResponse) passed correctly
  - Boolean props (stream, isDebugMode) passed correctly
- **Critical:** Must fail if any prop passing is broken

**2.2 Reactive Props Updates During Runtime** - Approved
- **Setup:** Initial render with props.input
- **Execute:** Update props.input to new value during component lifecycle
- **Assert:** 
  - BotContent re-receives updated input value
  - localStorage updated with new merged config
  - mergedConfig memo updates correctly
- **Critical:** Must fail if reactive prop updates break

**2.3 Props Input Integration with Session Restoration** - Approved
- **Setup:** 
  - Set `persistSession=true`, `stream=true`
  - Populate localStorage with session data containing API input
  - Render Bot with props.input
- **Execute:** Component restoration
- **Assert:** 
  - Session restores from localStorage (no API call)
  - BotContent still receives props.input (precedence maintained during restoration)
- **Critical:** Must fail if props precedence breaks during session restoration

### 3. Error Handling Integration Tests

**3.1 Error Display Prevents BotContent Rendering** - Approved
- **Setup:** Mock API to return error scenarios: `{ error: { statusCode: 404 } }`, `{ error: { code: 'BAD_REQUEST' } }`, `{ error: { code: 'FORBIDDEN' } }`
- **Execute:** Render Bot for each error scenario
- **Assert:** 
  - Correct ErrorMessage displayed for each error type
  - BotContent NOT rendered when error exists
  - Error messages match expected text ("doesn't exist", "agent is now closed")
- **Critical:** Must fail if error handling precedence over content rendering breaks

**3.2 Props Handling During Error States** - Approved
- **Setup:** Mock API to return error, render Bot with props.input
- **Execute:** Component initialization with error
- **Assert:** 
  - Error state takes precedence (no BotContent rendered)
  - Props merging doesn't interfere with error display
  - No localStorage operations occur during error states
- **Critical:** Must fail if props processing interferes with error handling

### 4. MergePropsWithApiData Function Integration Tests

**4.1 Merging Logic Correctness** - Approved
- **Setup:** Mock API with complete realistic data from `getInitialChatReplyQuery.json`
- **Execute:** Render Bot with various props combinations
- **Assert:** 
  - mergedConfig contains props values where provided
  - mergedConfig contains API values where props are undefined
  - customCss, sessionId, agentConfig correctly extracted from API data
- **Critical:** Must fail if merging utility logic breaks

**4.2 Null API Data Handling** - Approved
- **Setup:** Mock API to return null/undefined
- **Execute:** Render Bot with props.input
- **Assert:** 
  - Component handles null apiData gracefully
  - Props values still available in mergedConfig
  - Default values applied for missing API data
- **Critical:** Must fail if null API data breaks props merging


### 3. Test Setup Consistency
- Standardized test setup helpers that combine realistic data with specific overrides
- Consistent cleanup that verifies no side effects between tests
- Mock function verification helpers that check call patterns


## Test Data Strategy
- Use realistic mock data from `getInitialChatReplyQuery.json` and `localStorage.md`
- Create focused test data variants for specific scenarios (missing fields, invalid data)
- Import and extend existing test utilities from `test-utils.tsx`.
- Read helpers in `js/src/__tests__/components/Bot.sessionId.test.tsx` and do not create duplicate helpers. Instead move common helpers to `test-utils.tsx`.
- Create helper functions that modify realistic base data rather than minimal mocks
- Use consistent data shapes that match production API responses

## Assertion Strategy
- **Props Precedence**: Verify props values take precedence over API data in mergedConfig
- **Component Integration**: Check proper prop passing to child components
- **Reactive Updates**: Verify changes trigger appropriate effects and storage updates
- **Error Handling**: Ensure errors prevent content rendering and don't interfere with props
- **State Consistency**: Verify component signals maintain expected values throughout lifecycle

#### More Specific Assertions
Example for Storage: 
```typescript
// Enhanced storage verification
const storedSessionId = JSON.parse(localStorage.getItem('test-agent_sessionId'));
expect(storedSessionId).toBe('sess_1b30a00f1c61d0cb'); // From realistic test data

const storedConfig = JSON.parse(localStorage.getItem('test-agent_agentConfig'));
expect(storedConfig.theme.general.font).toBe('Amita'); // Verify structure
```


## Integration with Existing Tests
This plan complements the existing sessionId test plan by:
- Focusing on props integration rather than session lifecycle
- Testing mergePropsWithApiData utility integration
- Covering error handling scenarios not addressed in sessionId tests
- Providing cross-feature integration tests that bridge props and session functionality

This approach ensures comprehensive coverage without duplication, strengthening the overall Bot component test suite.