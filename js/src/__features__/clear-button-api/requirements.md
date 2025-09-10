
# Adding a programmatic way to invoke the clear button

The button would be used to clear the current chat similar to how the ClearButton  works but programmatically.

The ClearButton is implemented here @js/src/components/Bot.tsx where it invokes the function `handleClearSession`, we need to do exactly this using the API. 

# DESIGN

The file @js/src/window.ts contains some existing commands. we should add a `reset` command to this list.

Also look how it used in this @js/src/web.ts

We can follow the existing convention of having the implementation in the directory @js/src/features/commands/utils


Here is an example of implementation of a command for the popup widget @js/src/features/popup/components/Popup.tsx

The clear button should work for all widgets, so should have a common implementation in @js/src/components/Bot.tsx 

# TDD

Use TDD to design the feature. We need ONLY ONE test case for this enhancement. Before implementing the feature the test should fail, after implementing the test should pass. The test should try to invoke the `reset` command and after invoking it, it should check the localStorage, the data in the localStorage is unchanged for the agentName. Ensure the failure is happening because the localStorage is unchanged rather than because the `reset` command doesn't exist.

After implementation, the same test should pass since localStorage is cleared for the agentName.

## Test Structure & Setup
- Framework: Vitest with @solidjs/testing-library
- When possible use existing test utilities and patterns from `test-utils.tsx`, do not duplicate. If needed can created additional shared utilities in this file.
- Mock external dependencies (getInitialChatReplyQuery) but test real component behavior
- For network calls or certain dependencies - plan for a realistic mock response for the API call, but still ensure the component processes it correctly.

## Assertions
  - Assertions should be as described. Do not write your own assertions.
  - The tests must fail if the feature is broken.
  - No false positive tests – tests that pass with broken functionality are forbidden. 

## TEST DATA 
When needed plan to use the below real data for a realistic mock response of the API call, but still ensure the component processes it correctly.
   - The real response from `getInitialChatReplyQuery` is available in  `../js/src/__tests__/data/getInitialChatReplyQuery.json`
   - The local storage example data is available in `../js/src/__tests__/data/localStorage.md`

## Tests location
The tests should be created within the directory `../js/src/__tests__/` following the existing conventions.

## RUNNING TESTS
- After modifying or creating tests, always run `npm run build` to check for type errors and correct the type errors.