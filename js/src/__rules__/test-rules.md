
## Test Rules 

## Test Structure & Setup
- Framework: Vitest with @solidjs/testing-library
- When possible use existing test utilities and patterns from `test-utils.tsx`, do not duplicate. If needed can created additional shared utilities in this file.
- Mock external dependencies (getInitialChatReplyQuery) but test real component behavior
- Never plan excessive mocks or simulations unless absolutely necessary.
- For network calls or certain dependencies - plan for a realistic mock response for the API call, but still ensure the component processes it correctly.

## Assertions
  - Assertions in tests need to be meaningful. 
  - Do not write trivial assertions that always pass.
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