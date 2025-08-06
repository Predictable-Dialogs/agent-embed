

Goal: StreamConversation and ChatChunk receive already-resolved values.
- Create clearly named resolved signals/memos in Bot, e.g.:
  - resolvedInput = props.input ?? data.input (updates if props.input changes).
  - resolvedInitialMessages (array) based on persisted vs API decision

Why:
This removes the need for createMemo in StreamConversation.




