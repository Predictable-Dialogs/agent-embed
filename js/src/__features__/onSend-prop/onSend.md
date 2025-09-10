# Add new prop onSend.

The new onSend prop should be defined similar to the existing props in @js/src/constants.ts - it will be a defaultBotProps


This prop can take in a function as its value and this function would then be invoked in the @js/src/components/StreamConversation/FixedBottomInput.tsx
when the user clicks the SendButton button.