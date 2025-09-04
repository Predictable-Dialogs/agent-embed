

The chatbot can be customised using custom CSS. The custom css can be sent via the custom css prop of the chatbot. To do so existing classes on the chatbot can be targeted. 

Here are the list of classes and the descriptions. Followed by the limitations of what styles cannot be done via custom CSS.

Lets start with an example:

```
.agent-input {
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.12);
  border-radius: 0.75rem;
}
.agent-embed-container {
  border-radius: 6px;
}
.agent-host-bubble {
  border: 1px solid white;
  border-radius: 6px;
}
.agent-guest-bubble {
  border: 1px solid white;
  border-radius: 6px;
}

```

In the above css, the input element is getting a boxShadow and a border radius.

The main container which hosts the chatbot is getting a borderRadius of 6px.
The container in which the host text comes is called agent-host-bubble and is getting a white border with a border radius of 6px. Similarly the guest bubble gets the white border and border radius.

Similarly we can have a wide variety of custom CSS by targeting different classes in the code. Here is a list of classed which can be targeted with a description of what it can help style.

Here are some classes which can be targeted:
## .slate-html-container
Purpose: Container class for the markdown. 
Scope: This class is inside the host bubble. It is inside this class that entire markdown is shown as html. So if we need to style the container which holds the html elements we can use this class. 
Responsibility: Styling the html container.
Limitations: If we set a background on this class, it will create a border effect between the parent host bubble so avoid setting a background in this class. Also adding extra paddings in this will make the host bubble have a different structure from the guest bubble, so it should be avoided.

## .agent-embed-container
Purpose: Root-level theming container
Scope: Applied to the outermost Bot component container
Responsibility: Sets global theme variables (background, font-family, color)
Limitations: 
  
## .agent-chat-view
Purpose: ...
