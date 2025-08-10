
READ:
  - js/src/components/Bot.tsx
  - js/src/components/StreamConversation/*


The current implementation in Bot.tsx and StreamConversation/StreamConversation.tsx uses multiple createEffect and createMemo calls to handle dynamic props and API data. The goal here is to streamline reactivity management. centralize prop overriding - since more props can be overridden in future, and make the code more maintainable while preserving existing functionality.

# Step 1: Centralize Prop and API Data Merging

## Problem: 
The current code handles prop overriding (e.g., input) in a fragmented way, with createEffect for props.input and separate logic for API data in initializeBot. This makes it hard to track how props and API data are merged.

## Recommendation:
Introduce a utility function (e.g., mergePropsWithApiData) in Bot.tsx to handle the merging of props and API data in one place. This function should prioritize props over API data when both are present.
Use a single createMemo to compute the merged configuration, including input, customCss, and other properties fetched from getInitialChatReplyQuery.

Example structure:

Merge props like input with API data (data.input) in a reactive createMemo.
Store the merged result in a signal (e.g., mergedConfig) to be used throughout the component.

Benefit: Centralizing the merge logic improves readability by reducing scattered createEffect calls and makes it easier to debug prop overriding as in future the props could override more fields.

# Step 2: Simplify Reactivity for Dynamic Props

## Problem: 
The createEffect for props.input in Bot.tsx and the createMemo calls in StreamConversation.tsx create a chain of reactivity that is hard to follow. For example, initialInput is set reactively, then passed to initialAgentReply, which is processed in StreamConversation.tsx via createMemo.

## Recommendation:
Replace the createEffect for props.input in Bot.tsx with a createMemo that computes the effective input value (props override API). This memo can be part of the mergedConfig from Step 1.
In StreamConversation.tsx, simplify the initialMessages and inputValue createMemo calls by directly referencing the merged input from Bot.tsx instead of recomputing it. Pass the merged input as a prop to StreamConversation.
Ensure initialMessages only transforms messages once, avoiding redundant mapping logic.
Benefit: Reduces the number of reactive computations, making the data flow clearer and more predictable.