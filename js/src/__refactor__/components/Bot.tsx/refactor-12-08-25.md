# Refactor for Bot.tsx

We have code which writes and reads data from local storage in Bot.tsx.
Also in `js/src/components/StreamConversation/StreamConversation.tsx` there is code which writes to the localStorage. 

Lets move this code into a hook to make the component cleaner.

## RULES FOR REFACTORING Bot.tsx
- The unit tests in the dir `js/src/__tests__/components/Bot`, should not fail.