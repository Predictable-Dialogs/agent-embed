# Documentation on Bot.tsx

## Overview

1. **First load** → nothing in storage → `initializeBot()` fetches new data → `sessionId`, `agentConfig`, `customCss` immediately get persisted by the effect.
2. **Page refresh** with `persistSession` + `stream` turned on → the component finds a complete session bundle in storage and instantly restores it; no network request needed.
3. **Session expires** (e.g., server TTL) → keys are wiped and a new session is negotiated.



## 1.  Key-naming convention

```ts
const getStorageKey = (key: string) =>
  props.agentName ? `${props.agentName}_${key}` : key;
```

* All records are namespaced by **`agentName`**.

Keys used in this file:

| Purpose                  | Key built from `getStorageKey()` |
| ------------------------ | -------------------------------- |
| Session id (UUID)        | `…_sessionId`                    |
| Chat message history     | `…_chatMessages`                 |
| Agent configuration JSON | `…_agentConfig`                  |
| Custom CSS string        | `…_customCss`                    |
| Global debug flag        | `debugMode` (not namespaced)     |


## 2.  Reading previously-saved session ( `onMount` )

When the component mounts it:

1. Calls `getSessionId()`, `getAgentConfig()`, `getCustomCss()`, `getPersistedMessages()` – each simply `JSON.parse()`-ing the stored string (or returning `null/[]` when absent).
2. If **all** of these conditions hold
   `props.stream === true`
   `props.persistSession === true`
   non-empty `storedMessages` **and** a valid `storedSessionId` **and** `storedAgentConfig`
   then the stored data are treated as an *active* session:

   ```ts
   const restoredData = {
     sessionId: storedSessionId,
     agentConfig: storedAgentConfig,
     theme: { customCss: storedCustomCss || '' },
     messages: [],
     clientSideActions: [],
     input: null,
   };
   setApiData(restoredData);
   setIsInitialized(true);
   ```
3. Otherwise it fetches fresh data from the backend via `initializeBot()`.

> **Why persistSession prop?**
> *`persistSession`* is an opt-in since currently there is no button to start a new session.

---

### 3.  Writing to storage ( `createEffect` )

```ts
createEffect(() => {
  const config = mergedConfig();   // live view that merges props ⟶ API data
  if (config.customCss)
    localStorage.setItem(getStorageKey('customCss'), JSON.stringify(config.customCss));

  if (config.sessionId)
    localStorage.setItem(getStorageKey('sessionId'), JSON.stringify(config.sessionId));

  if (config.agentConfig)
    localStorage.setItem(getStorageKey('agentConfig'), JSON.stringify(config.agentConfig));
});
```

<!-- * The effect reruns automatically whenever **`mergedConfig()`** changes (for example, when a new session id arrives from the server or the user updates their theme).
* Only three fields are saved here.
  **Message history (`chatMessages`) is *not* written by this component**; it is expected that the child component **`StreamConversation`** appends to that same key whenever a message completes.
 -->
---

### 4.  Clearing an expired session

We pass a callback function to StreamConversation.tsx which does the initial handling and then invokes `handleSessionExpired`. 

```ts
localStorage.removeItem(getStorageKey('sessionId'));
localStorage.removeItem(getStorageKey('chatMessages'));
setPersistedMessages([]);
```