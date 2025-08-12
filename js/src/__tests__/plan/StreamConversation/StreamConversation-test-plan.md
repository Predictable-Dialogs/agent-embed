# Unit Test Plan for StreamConversation Component

Based on the component documentation and source code analysis, here's a comprehensive test plan for all functional features (excluding dynamic theme merging and file attachments as specified).

## Test Structure

**Location**: `/js/src/__tests__/components/StreamConversation/StreamConversation.test.tsx`

**Test Data**: Use existing test data from:
- `getInitialChatReplyQuery.json` for realistic API responses
- `localStorage.md` for persisted message scenarios
- `test-utils.tsx` factory functions for consistent mock data

## Detailed Test Cases

### 1. Initial Message Bootstrapping

**Feature**: Component properly initializes messages from either persisted storage or initial agent reply.

**Test Cases**:

1. **With Persisted Messages**
   - **Setup**: Provide `persistedMessages` array with sample chat history
   - **Verify**: All persisted messages are marked with `isPersisted: true`, when loading the messages from localstorage.
   - **Verify**: Messages are passed correctly to `useChat` as `initialMessages`
   - **Assert**: DOM renders the correct number of ChatChunk components

2. **Without Persisted Messages (Fresh Start)**
   - **Setup**: Empty `persistedMessages` array, provide `initialAgentReply.messages`
   - **Verify**: Initial messages are transformed through `transformMessage` with correct parameters
   - **Assert**: Only initial agent messages are rendered

3. **Empty State**
   - **Setup**: Empty `persistedMessages` and empty `initialAgentReply.messages`
   - **Verify**: No ChatChunk components are rendered initially
   - **Assert**: Container structure is still present

### 2. Chat API Wiring (Vercel AI SDK)

**Feature**: Proper integration with useChat hook and API configuration.

**Test Cases**:

1. **API Endpoint Selection - Custom Stream Host**
   - **Setup**: Provide `context.apiStreamHost` value
   - **Mock**: `useChat` to capture configuration
   - **Verify**: `useChat` receives the custom `apiStreamHost` as `api` parameter
   - **Assert**: Stream protocol is set to 'data'

2. **API Endpoint Selection - Default Endpoint**
   - **Setup**: Empty/null `context.apiStreamHost`
   - **Mock**: `getApiStreamEndPoint()` to return default URL
   - **Verify**: `useChat` receives default endpoint from `getApiStreamEndPoint()`

3. **Request Body Preparation**
   - **Setup**: Simulate message submission with multiple messages in history
   - **Mock**: `useChat` to capture `experimental_prepareRequestBody` calls
   - **Verify**: Only the last message content is sent (not full history)
   - **Verify**: `sessionId` and `agentName` from context are included
   - **Assert**: Request body structure matches expected format

4. **Error Handling - Session Expired**
   - **Setup**: Trigger `onError` with message 'Session expired. Starting a new session.'
   - **Mock**: `onSessionExpired` callback
   - **Verify**: `onSessionExpired` is called
   - **Verify**: Loading spinner is cleared (`isSending` becomes false)

5. **Error Handling - Other Errors**
   - **Setup**: Trigger `onError` with different error message
   - **Mock**: `onSessionExpired` callback
   - **Verify**: `onSessionExpired` is NOT called
   - **Verify**: Loading spinner is still cleared

### 3. Local Message Persistence

**Feature**: Messages are automatically saved to localStorage with proper naming.

**Test Cases**:

1. **Persistence with Agent Name**
   - **Setup**: Provide `context.agentName = 'test-agent'`
   - **Simulate**: Add new messages to chat
   - **Verify**: Messages saved to localStorage with key `test-agent_chatMessages`
   - **Assert**: Saved data matches current messages array


2. **Persistence Update on Message Changes**
   - **Setup**: Start with initial messages
   - **Simulate**: Add multiple new messages over time
   - **Verify**: localStorage is updated after each message addition
   - **Assert**: Final localStorage state contains all messages

### 4. Hydration/Cleanup of Stale User Tail

**Feature**: Removes trailing user messages from persisted state on mount.

**Test Cases**:

1. **Remove Stale User Message**
   - **Setup**: `persistedMessages` ending with a user message marked `isPersisted: true`
   - **Verify**: Last user message is removed on mount
   - **Assert**: DOM doesn't render the removed user message

2. **Keep Non-User Last Message**
   - **Setup**: `persistedMessages` ending with an assistant message
   - **Verify**: No messages are removed

3. **Handle Empty Messages After Cleanup**
   - **Setup**: `persistedMessages` with only one persisted user message
   - **Verify**: Message is removed, messages array becomes empty
   - **Assert**: No ChatChunk components are rendered


### 6. Auto-scrolling Behavior

**Feature**: Automatic scrolling to keep conversation visible.

**Test Cases**:

1. **Initial Mount Scrolling**
   - **Setup**: Component with existing messages
   - **Mock**: `scrollTo` method on container element
   - **Verify**: Container scrolls to bottom with 'auto' behavior on mount
   - **Verify**: 'scroll-smooth' and 'ready' classes are added after delay

3. **Auto-scroll with Custom Offset**
   - **Setup**: Component mounted
   - **Simulate**: Call `onDisplayAssistantMessage` with specific `bubbleOffsetTop`
   - **Verify**: Scroll uses the provided offset instead of `scrollHeight`

### 7. Send/"Long Request" Loading Indicator

**Feature**: Shows loading spinner for requests taking longer than 2 seconds.

**Test Cases**:

1. **Quick Response (Under 2 seconds)**
   - **Setup**: Component ready for submission
   - **Simulate**: Submit message, then immediately receive assistant response
   - **Verify**: `isSending` remains false
   - **Assert**: LoadingChunk is not rendered

2. **Slow Response (Over 2 seconds)**
   - **Setup**: Component ready for submission
   - **Simulate**: Submit message, wait >2 seconds without response
   - **Verify**: `isSending` becomes true after 2 second delay
   - **Assert**: LoadingChunk is rendered

3. **Cancel Loading on Assistant Message**
   - **Setup**: Loading spinner is active (`isSending: true`)
   - **Simulate**: Receive assistant message
   - **Verify**: `isSending` becomes false immediately
   - **Verify**: Timer is cleared
   - **Assert**: LoadingChunk disappears

### 8. Streaming Handlers Surfaced to Children

**Feature**: Provides input and submit handlers to ChatChunk components.

**Test Cases**:

1. **Handlers Creation and Memoization**
   - **Setup**: Component with working `useChat` handlers
   - **Verify**: `streamingHandlers` object is created with `onInput` and `onSubmit`
   - **Verify**: Handlers are memoized (same reference on re-renders)

2. **Submit Handler Behavior**
   - **Setup**: Component ready
   - **Mock**: `handleSubmit` from useChat
   - **Simulate**: Call `streamingHandlers.onSubmit` with event
   - **Verify**: Event default is prevented
   - **Verify**: `handleSubmit` is called with experimental_attachments
   - **Verify**: Files are reset to undefined

3. **Input Handler Delegation**
   - **Setup**: Component ready
   - **Mock**: `handleInputChange` from useChat
   - **Simulate**: Call `streamingHandlers.onInput` with event
   - **Verify**: `handleInputChange` is called with the event

### 9. Error and Toast UI

**Feature**: Displays error messages when API calls fail.

**Test Cases**:

1. **Error Display**
   - **Setup**: Component with no initial errors
   - **Simulate**: `useChat` returns error with specific message
   - **Verify**: ErrorChunk is rendered
   - **Assert**: Error message is displayed correctly

2. **No Error State**
   - **Setup**: Component working normally
   - **Verify**: `error()` is falsy
   - **Assert**: ErrorChunk is not rendered

3. **Error Clearing**
   - **Setup**: Component showing error
   - **Simulate**: Clear error from `useChat`
   - **Assert**: ErrorChunk disappears from DOM

### 10. Message Rendering & filtering

**Feature**: Renders all messages as ChatChunk components with correct props.

**Test Cases**:

1. **Message Props Assignment**
   - **Setup**: Mixed messages (user and assistant)
   - **Verify**: Each ChatChunk receives correct `message` prop
   - **Verify**: Assistant messages get `input` prop, user messages don't
   - **Verify**: All messages get theme, settings, context props
   - **Assert**: Correct number of ChatChunk components rendered

2. **Filter Response Application**
   - **Setup**: Provide `filterResponse` prop function
   - **Verify**: ChatChunk receives the `filterResponse` function
   - **Assert**: Function is passed through correctly

3. **Persisted Status Propagation**
   - **Setup**: Mix of persisted and non-persisted messages
   - **Verify**: Each ChatChunk receives correct `isPersisted` value
   - **Assert**: Persisted status matches message metadata

### 11. Status-aware First Render

**Feature**: Handles initial render when chat status becomes ready.

**Test Cases**:

1. **Multi-message Ready State**
   - **Setup**: Multiple messages, status transitions to 'ready'
   - **Verify**: Auto-scroll is triggered


### 12. Styling/Layout

**Feature**: Proper DOM structure and CSS classes.

**Test Cases**:

1. **Container Structure**
   - **Setup**: Render component
   - **Assert**: Main container has correct CSS classes
   - **Assert**: BottomSpacer is rendered at the end

2. **Container Reference Assignment**
   - **Setup**: Render component
   - **Verify**: `chatContainer` ref is properly assigned
   - **Assert**: Ref can be used for scroll operations

## Test Implementation Strategy

**Mocking Approach**:
- Mock `useChat` from `@ai-sdk/solid` with realistic return values
- Mock `getApiStreamEndPoint` to return predictable URLs
- Mock `transformMessage` utility to return enhanced messages
- Use real localStorage operations with cleanup
- Mock `setTimeout`/`clearTimeout` for timer testing

**Assertion Strategy**:
- Test actual DOM changes and component state
- Verify localStorage contents after operations
- Check function call arguments and timing
- Assert on visible UI elements (LoadingChunk, ErrorChunk, ChatChunk count)
- Validate scroll behavior through mock verification

**Test Data Usage**:
- Use real message structure from `getInitialChatReplyQuery.json`
- Use realistic localStorage data patterns from `localStorage.md`
- Leverage existing factory functions from `test-utils.tsx`

This test plan ensures comprehensive coverage of all functional features while focusing on end-to-end behavior verification rather than excessive mocking.