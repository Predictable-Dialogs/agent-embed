# Unit Tests For SessionId in Bot.tsx

The session id comes from the API. A new session id is created when the prop persistSession is false. When persistSession is true an existing session id can be re-used. 

Need to ensure the proper behaviour of sessionId in the component Bot.tsx. All scenarios related to sessionId in the Bot.tsx component should be covered. And at the minimum cover the following cases:
   
## Minimum Coverage
- We must get a new session id whenever persist session is false
- We must get a new session id whenever persist session is true but there is no session id in localstorage.
- We must re-use the existing session id when persist session is true and there is a session id and other needed data in localstorage.


## Rules for Planning for SessionId in Bot.tsx
- Plan with real data and real functions that verify end-to-end functionality. 
- Never plan excessive mocks or simulations unless absolutely necessary.
- For network calls or certain dependencies - plan for a realistic mock response for the API call, but still ensure the component processes it correctly.

## TEST DATA 
Plan to use the below data for a realistic mock response of the API call, but still ensure the component processes it correctly.
   - The real response from `getInitialChatReplyQuery` is available in  `../js/src/__tests__/data/getInitialChatReplyQuery.json`
   - The local storage example data is available in `../js/src/__tests__/data/localStorage.md`

## Tests location
The tests should be created within the directory `../js/src/__tests__/` following the existing conventions.