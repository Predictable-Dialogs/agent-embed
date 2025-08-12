# Unit Tests For StreamConversation.tsx

We need to plan the unit test for the StreamConversation component. We need to plan tests for all the functional features described in the documentation EXCEPT for the features below, for which the tests should not be planned.
      - We do not need tests for “Dynamic theme merging”
      - We do not need tests for File attachments support

## Minimum Coverage
- All functional features described in the documentation except those listed above.

## Rules for test planning in StreamConversation.tsx
- Plan with real data and real functions that verify end-to-end functionality. 
- Never plan excessive mocks or simulations unless absolutely necessary.
- For network calls or certain dependencies - plan for a realistic mock response for the API call, but still ensure the component processes it correctly.

## TEST DATA 
Plan to use the below data for a realistic mock response of the API call, but still ensure the component processes it correctly.
   - The real response from `getInitialChatReplyQuery` is available in  `../js/src/__tests__/data/getInitialChatReplyQuery.json`
   - The local storage example data is available in `../js/src/__tests__/data/localStorage.md`
   - Instead of creating duplicate; only reuse or add test utils in `../../test-utils.tsx`, do not modify or delete any test utils.

## Tests location
The tests should be created within the directory `../js/src/__tests__` following the existing conventions.