
# Adding a clear button

The button would be used to clear the current chat. Like a reset button.

Important files:
For LiteBadge, localStorage etc : `agent-embed/js/src/components/Bot.tsx`

## Button Colors, Size and implementation
The button component is implemented here: `agent-embed/js/src/components/Button.tsx`
This is used at multiple places in the code, so those usages should not be affected.
The button colors should be the same as variant of secondary like this:  <Button variant="secondary" ... 
But, it should be aesthetically at the appropriate size, maybe slightly smaller than the secondary.

## Button Positioning

We need to add a "clear" button at the right bottom of the chat widget container. This button would be in
the same line in which we have the LiteBadge, the LiteBadge is positioned with a small margin, the button would be positioned similarly on the right side. So the overall container is symetrical with the LiteBadge on the left side and the clear button the on the right side. 

## Button UI Testing
Use playwright mcp server to review the size and positioning of the button to make it aesthetically good.


## Button Behaviour
On clicking the button 
   - The localstorage should be cleared of the old session data.
   - After clearing the localstorage, we need to initialize the bot again in an error free and efficient way. 

The css for this should follow the rules specified in the file: `agent-embed/js/src/__rules__/css-rules.md`

