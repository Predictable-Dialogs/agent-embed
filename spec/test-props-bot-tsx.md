# Unit Tests For Props in Bot.tsx

In the Bot component, the props is/are mergePropsWithApiData, with the values from the props given precedence.

Currently there is the props.input which is implemented.

We need to plan for a test to ensure that if props.input is present then it is passed to the BotContent component, if props.input is undefined then the value of props.input is taken from what is returned from getInitialChatReplyQuery.

This will need to understand the implementation in mergePropsWithApiData hook which is implemented in the file `js/src/utils/mergePropsWithApiData.ts`

The test should be designed in such a way, so that in the future, when we add more props which would take precedence, writing tests would be easy, by re-uding the test utils created for this test.

## Minimum Coverage
- We pass the `props.input` to `BotContent` when `props.input` is defined.
- We pass the value of input from `getInitialChatReplyQuery` when `props.input` is undefined.


## Rules for test planning in Bot.tsx
- Plan with real data and real functions that verify end-to-end functionality. 
- Never plan excessive mocks or simulations unless absolutely necessary.
- For network calls or certain dependencies - plan for a realistic mock response for the API call, but still ensure the component processes it correctly.

## TEST DATA 
Plan to use the below data for a realistic mock response of the API call, but still ensure the component processes it correctly.
   - The real response from `getInitialChatReplyQuery` is available in  `../js/src/__tests__/data/getInitialChatReplyQuery.json`
   - The local storage example data is available in `../js/src/__tests__/data/localStorage.md`

## Tests location
The tests should be created within the directory `../js/src/__tests__/` following the existing conventions.