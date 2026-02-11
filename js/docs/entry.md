
# How do we declare the <agent-standard> element in our HTML and configure it through the JavaScript API.

## Entry Point Flow:

`web.ts -> window.ts -> register.tsx`

## The Process:
First, when the script is loaded, web.ts runs and:
 - Registers the web components via registerWebComponents()
 - Creates the agent object using parsePredictable()
 - Injects the agent into the window object

 ### When `Agent.initStandard()` is called:
 ```
 Agent.initStandard({ 
  agentName: "Assistant OpenAI-...", 
  apiHost: "https://...",
  initialPrompts: [{ text: "Hi" }] 
  });
 ```

The call in the script tag passes the props to `initStandard` function in `window.ts` which then:
 - Looks for an existing <agent-standard> element in the DOM
 - Uses Object.assign() to merge these props into the <agent-standard> element as shown below:
 ```
 export const initStandard = (props: BotProps & { id?: string }) => {
  if (typeof window !== 'undefined') {
    const standardElement = props.id
      ? document.getElementById(props.id)
      : document.querySelector('agent-standard')
    if (!standardElement) throw new Error('<agent-standard> element not found.')
    Object.assign(standardElement, props)
  }
}
```

### The Custom Element Connection:
 - The <agent-standard> element was registered in register.tsx using:
 ```
 customElement('agent-standard', defaultBotProps, Standard)
 ```

- This registration makes the props available to the Standard component through Solid.js's custom element system.

The props passed (agentName, apiHost, initialPrompts) override any defaultBotProps

### Summary Flow
- Register Web components
- script calls Agent.initStandard(props)
- props are assigned to the <agent-standard> element
- Solid.js component receives these props and renders accordingly


This is how we declare the <agent-standard> element in our HTML and configure it through the JavaScript API.
