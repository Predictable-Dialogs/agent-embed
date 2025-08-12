# Functional features

* **Dynamic theme merging**

  * Derives a live `theme` from `agentConfig.theme` plus `initialAgentReply.dynamicTheme` via `parseDynamicTheme`, replacing only avatar URLs if the base theme already defines those avatars.
  * Re-computes the merged theme whenever `dynamicTheme` changes.

* **Initial message bootstrapping**

  * If `persistedMessages` exist, seeds the chat with those and tags each with `isPersisted: true`. `isPersisted` is used so that, when messages in localStorage are displayed it is not jarring. This flag is set on the messages while loading the messages from localstorage.
  * Otherwise, maps `initialAgentReply.messages` through `transformMessage(..., 'assistant', initialAgentReply.input)` and tags them `isPersisted: false`.
  * Passes these as `initialMessages` to `useChat`.

* **Chat API wiring (Vercel AI SDK)**
  The AI SDK returns SolidJS signals/accessors (functions), not plain values. The component calls messages(), error(), etc. as
  functions.
  * Uses `useChat` with:

    * `api` chosen from `context.apiStreamHost` or `getApiStreamEndPoint()`.
    * `streamProtocol: 'data'`.
    * `experimental_prepareRequestBody` that sends only the **last message content**, plus `sessionId` and `agentName` (does **not** send the full history).
  * On error: cancels any “long request” timer, clears the sending spinner, and calls `onSessionExpired()` **only** if the error message is exactly `'Session expired. Starting a new session.'`.

* **Local message persistence (per-agent key)**

  * On every `messages()` change, writes to `localStorage` under key `${agentName}_chatMessages` (or `chatMessages` if no agent name).

* **Hydration/cleanup of stale user tail**

  * On mount, if the last message is a **persisted** user message, it removes that last user message to avoid showing an un-submit-ted tail after reload/hydration.
  * After cleanup, sets `displayIndex` to the new last message’s `id` (if present).

* **Display index & first-assistant handling**

  * Maintains a `displayIndex` (defaults to `'#HIDE'`) and updates it:

    * When status becomes `'ready'` and the last message is an assistant (excluding the single-message case).
    * Via `onDisplayAssistantMessage` for the special case when there is exactly **one** message (the first assistant message isn’t streamed).
  * `displayIndex` is passed to each `ChatChunk` to control which assistant bubble is “the one” to display/expand.

* **Auto-scrolling behavior**

  * After mount, scrolls to the bottom, then enables smooth scrolling by adding `scroll-smooth` and `ready` classes.
  * Provides `autoScrollToBottom(offsetTop?)` (50ms delayed) and calls it on relevant state changes (e.g., after setting `displayIndex`).

* **Send/“long request” loading indicator**

  * On submit:

    * Hides `displayIndex` (`'#HIDE'`), starts a 2-second timer; if still pending after 2s, sets `isSending=true` to show `<LoadingChunk />`.
    * Calls `handleSubmit(e, { experimental_attachments: files() })`.
  * Any time an assistant message is encountered during render, it cancels the timer and clears the spinner (`isSending=false`).

* **Streaming handlers surfaced to children**

  * Exposes `streamingHandlers` (memoized) with:

    * `onInput` → `handleInputChange`
    * `onSubmit` → the custom submit handler described above
  * These handlers are passed into every `ChatChunk`, letting a child render the input form and wire it to the chat engine.

* **Error and toast UI**

  * Shows `<ErrorChunk />` when `error()` is truthy, displaying `error()?.message`.

* **File attachments support (prepared but not yet wired here)**

  * Maintains `files: Signal<FileList | undefined>` and a `fileInputRef`.
  * Submits attachments via `experimental_attachments: files()`.
  * Resets the file input after submit **if** `fileInputRef` is assigned. (This component doesn’t assign it; a child would need to.)

* **Message rendering & filtering**

  * Renders all `messages()` with `<ChatChunk />`, passing:

    * `theme`, `settings`, `context`, `hideAvatar=false`, `isPersisted`, `filterResponse` (optional text filter), `onScrollToBottom`, and `input` (only for assistant messages: `initialAgentReply.input`).

* **Status-aware first render**

  * When `status() === 'ready'` and there’s more than one message, sets `displayIndex` to the last assistant message and scrolls down—handling the non-streamed initial assistant reply case.

* **Styling/layout**

  * Provides a scrollable container with padding and a trailing `<BottomSpacer />` to keep the composer area visible and avoid overlap.