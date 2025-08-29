

Currently the chat container in @js/src/components/StreamConversation/StreamConversation.tsx has styles which makes it take the full length of the parent container. This works well when the input is not the "fixed-bottom" 
input. When we have the fixed bottom input, then we want to restrict the height of the chat container till the start of the fixed bottom input. The issue when it extends beyond the fixed bottom is the streaming text is visible after the bottom input. 

So we want the streaming text container to end when the fixed bottom input starts.
This is the first step. The next step would be to add overflow hidden so that even if the container increases in height it remains hidden.

# What we have tried - but did not work
Modify the chat container height calculation to account for the fixed-bottom input space.

     Step 1: Update StreamConversation chat container styling

     - Modify the chat container in StreamConversation.tsx:217-223
     - Change from min-h-full to use calc() to subtract fixed input height when fixed-bottom type is active
     - For standard widgets with fixed-bottom input: use height: calc(100% - 200px) instead of padding-bottom: 200px
     - Keep min-h-full for non-fixed-bottom inputs to maintain current behavior

     Step 2: Add overflow-hidden for robustness

     - Add overflow: hidden to the chat container when fixed-bottom input is present
     - This ensures that even if content exceeds the calculated height, it remains hidden behind the input


# Testing:
Use the mcp playwright to test the changes, you can open the chatbot by opening the url http://localhost:8000/pd/agent-embed/js/src/__tests__/fixtures/localhost/basic/standard.html

after opnening the url type and submit a text like "tell me a short story", you can see the streaming and the streaming text should disappear before the fixed-bottom input starts and not appear again after the fixed-bottom input.