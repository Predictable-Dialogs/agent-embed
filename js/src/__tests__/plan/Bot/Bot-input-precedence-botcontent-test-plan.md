# Unit Test Plan for Bot.tsx - Input Precedence with BotContent Verification

## Test File Location
`js/src/__tests__/components/Bot.input-precedence-botcontent.test.tsx`

## Objective
Create two separate test cases that directly verify StreamConversation component receives correct input values when props take precedence over API data.

## Test Structure & Setup
- Framework: Vitest with @solidjs/testing-library
- Use existing test utilities and patterns from `test-utils.tsx`
- Mock StreamConversation component to capture props directly
- Use realistic test data from existing test files

## Core Test Scenarios

### Test Case 1: Component Mount Scenario
**Test**: "should pass props.input to StreamConversation when both props and API provide input on mount"

**Approach**:
1. Mock StreamConversation component to capture its `initialAgentReply` prop
2. Setup API response with input values
3. Render Bot with different props.input values  
4. Verify StreamConversation receives props.input (not API input) in `initialAgentReply`

**Key Verification Points**:
- StreamConversation receives `initialAgentReply.input` with props values
- API input values are ignored when props.input is provided
- Merging logic works correctly on component mount

### Test Case 2: Props Change Scenario  
**Test**: "should update StreamConversation with new props.input when props change dynamically"

**Approach**:
1. Mock StreamConversation component to capture prop changes
2. Render Bot with initial props.input
3. Update props.input using createSignal pattern
4. Verify StreamConversation receives updated props.input values

**Key Verification Points**:
- StreamConversation receives updated `initialAgentReply.input` when props change
- Props changes trigger proper updates to StreamConversation
- Dynamic updates work correctly with the reactive system

## Implementation Strategy

### StreamConversation Mock Setup
- Mock StreamConversation to test Bot → BotContent → StreamConversation data flow, since BotContent is not exported.
- Capture `initialAgentReply` prop in StreamConversation mock to verify the merged input
- Display captured values via test data attributes for verification

### Test Data Strategy
- Use realistic mock data following existing patterns
- Setup API responses with different input values than props
- Ensure clear distinction between API and props input for verification

### Assertion Strategy
- Verify StreamConversation receives correct input values through mock prop capture
- Test both scenarios separately as they have different code paths

## Rationale
This approach directly tests the Bot → StreamConversation interface, ensuring the merging logic works. Testing at the BotContent level is more complex since it is not exported. 

## Expected Outcomes
1. Clear verification that props.input takes precedence over API input at StreamConversation level
2. Confirmation that dynamic props changes work correctly
3. Direct testing of the mergePropsWithApiData integration with StreamConversation