In my solids code we need to change the scroll behaviour, the current behaviour completes the streaming and then scrolls everything up which is not good. 

the files which would be changed are: @js/src/components/StreamConversation/StreamConversation.tsx

We instead need to auto-scroll the container as text streams in: This is a common pattern in chat interfaces (e.g., like ChatGPT or similar apps). As new text chunks arrive, the container automatically scrolls to the bottom to keep the latest content visible, preventing it from disappearing under the fixed bottom element. To make it "best-in-class," we should add logic to only auto-scroll if the user hasn't manually scrolled up (i.e., respect user intent). If they scroll up to read previous content, pause auto-scroll until they scroll back down.


### Detailed Plan for Code Changes

To address the scroll behavior issues, we need to implement auto-scrolling that follows the streaming text in real-time while respecting user intent. This means:
- Scroll to the bottom automatically as new content (e.g., streaming chunks) is added or updated.
- Only auto-scroll if the user is already near the bottom of the chat container (indicating they want to follow the latest content).
- If the user scrolls up (e.g., to read previous messages), pause auto-scrolling until they scroll back down (handled passively by checking the scroll position on each update).
- On user submit (sending a message), force scroll to the bottom regardless of current position, as this aligns with user expectation to see their new message and the response.
- Ensure smooth integration with existing logic, such as initial mounting, streaming status, and display index handling.
- No changes are needed in Bot.tsx, as the scroll logic is isolated to StreamConversation.tsx.
- Use a threshold (e.g., 100 pixels) for "near bottom" to account for minor offsets or floating-point inaccuracies.
- Switch all scrolls to use `{ behavior: 'auto' }` for instant updates during rapid streaming (avoid 'smooth' to prevent lag; can adjust to 'smooth' if testing shows it's better).
- Remove redundant or conflicting scroll calls to centralize logic in a new effect and the submit handler.

#### Step 1: Add Helper Functions
- Add `isNearBottom()` to check if the user is near the bottom before auto-scrolling.
- Update `autoScrollToBottom()` to accept an optional `force` parameter (default `false`). If `force` is true, scroll regardless; otherwise, check `isNearBottom()`. Reduce timeout to 0 for faster response (original 50ms may cause delays; test and increase if needed for DOM settling).

Code to add/update in StreamConversation.tsx (near the top, after signals):

```typescript
const isNearBottom = () => {
  if (!chatContainer) return false;
  const threshold = 100; // Adjustable; pixels from bottom to consider "near"
  const { scrollHeight, scrollTop, clientHeight } = chatContainer;
  return scrollHeight - scrollTop - clientHeight < threshold;
};

const autoScrollToBottom = (force: boolean = false) => {
  if (!chatContainer) return;
  setTimeout(() => {
    if (force || isNearBottom()) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'auto', // 'auto' for instant; change to 'smooth' if preferred for UX
      });
    }
  }, 0); // Reduced from 50ms for faster streaming follow; increase if DOM not ready
};
```

#### Step 2: Add Effect for Auto-Scrolling on Message Updates
- Create an effect that depends on `messages()`. This will trigger whenever messages change (e.g., new message added, or streaming chunk appends to the last message's content).
- Call `autoScrollToBottom(false)` inside the effect to respect user scroll position (no force).
- This handles real-time streaming: as chunks arrive, the effect runs after render, checks if near bottom, and scrolls if yes.

Code to add in StreamConversation.tsx (after the `createEffect(() => { storage.setChatMessages(messages()); })`):

```typescript
createEffect(() => {
  messages();
  autoScrollToBottom(); // Defaults to force=false, so checks isNearBottom
});
```

#### Step 3: Update onSubmit Handler to Force Scroll
- In `streamingHandlers().onSubmit`, after calling `handleSubmit`, add `autoScrollToBottom(true)` to force scroll to the bottom. This shows the user's new message immediately.
- `handleSubmit` likely adds the user message synchronously, so the scroll will account for it. The effect will handle subsequent streaming updates.
- Wrap in `setTimeout(0, ...)` if testing shows the DOM hasn't updated yet, but it's probably unnecessary.

Updated code in the `streamingHandlers` createMemo (replace the existing onSubmit):

```typescript
onSubmit: (e: Event) => {
  e.preventDefault();
  setdisplayIndex('#HIDE');
  setIsFixedInputDisabled(true);
  longRequest = setTimeout(() => {
    setIsSending(true);
  }, 2000);
  handleSubmit(e, {
    experimental_attachments: files(),
  });

  // Reset form
  setFiles(undefined);
  if (fileInputRef) {
    fileInputRef.value = '';
  }

  autoScrollToBottom(true); // Force scroll to show user message
},
```

#### Step 4: Update onMount for Consistency
- Replace the existing `chatContainer?.scrollTo(...)` with `autoScrollToBottom(true)` to force initial scroll (consistent with new logic).
- Keep the `setTimeout(50, ...)` for initial scroll if needed for DOM readiness, but align with the updated function.
- Retain the `queueMicrotask` for adding classes ('scroll-smooth' and 'ready').

Updated code in onMount (replace the setTimeout block):

```typescript
onMount(() => {
  const currentMessages = messages();
  if (currentMessages.length > 0) {
    const lastMessage = currentMessages?.[currentMessages.length - 1];
    // If the last message is from a user and is persisted, remove it
    if (lastMessage.role === 'user' && (lastMessage as EnhancedUIMessage).isPersisted) {
      const filteredMessages = currentMessages.slice(0, -1);
      setMessages(filteredMessages);
      
      // If we have messages left, use the last one for displayIndex
      if (filteredMessages.length > 0) {
        const newLastMessage = filteredMessages[filteredMessages.length - 1];
        if (newLastMessage.id) {
          setdisplayIndex(newLastMessage.id);
        }
      }
    } else if (lastMessage.id && (lastMessage as EnhancedUIMessage).isPersisted) {
      // Set display index for the last persisted message (if it's not a user message)
      setdisplayIndex(lastMessage.id);
    }

    autoScrollToBottom(true); // Force initial scroll to bottom

    queueMicrotask(() => {
      chatContainer?.classList.add('scroll-smooth');
      chatContainer?.classList.add('ready');
    });
  }
});
```

#### Step 5: Remove/Conditionalize Existing Scroll Calls
- In the createEffect on `status() === 'ready'`: Remove `autoScrollToBottom()`. The new messages effect handles this. Keep `setdisplayIndex` as it's unrelated to scrolling.
  
  Updated code (replace the effect):

  ```typescript
  createEffect(() => {
    if (status() === 'ready') {
      const currentMessages = messages();
      if (currentMessages.length !== 1) {
        // The first message is not streamed so set this
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          setdisplayIndex(lastMessage.id);
          // Remove: autoScrollToBottom(); // Handled by new effect
        }  
      }
    }  
  });
  ```

- In `onDisplayAssistantMessage`: Remove the `autoScrollToBottom(bubbleOffsetTop)` call entirely, as scrolling to a specific offsetTop (likely the message's top) conflicts with bottom-following during streaming. Keep `setdisplayIndex` if it's needed for visibility logic. Remove the `bubbleOffsetTop` parameter from the function signature and any calls to it (you'll need to check ChatChunk.tsx for the call site and remove the arg there too).

  Updated code:

  ```typescript
  const onDisplayAssistantMessage = async () => { // Remove bubbleOffsetTop param
    const currentMessages = messages();
    const lastMessage = currentMessages?.[currentMessages.length - 1];
    if (lastMessage?.id && currentMessages.length === 1) {
      // the first message is not streamed so set this.
      setdisplayIndex(lastMessage.id);
      // Remove: autoScrollToBottom(bubbleOffsetTop); // Handled by new effect
    }
  };
  ```

- In ChatChunk props: Update to `onDisplayAssistantMessage={onDisplayAssistantMessage}` (no param).

#### Step 6: Implementation Notes
- Apply changes only to StreamConversation.tsx.
- After changes, the behavior should match "best-in-class" like ChatGPT: real-time following with user intent respect.