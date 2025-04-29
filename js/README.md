# Agent embed JS library

Add an [OpenAI Chatbot](https://predictabledialogs.com) to your website using this library.

## Pre-requisite
Create an agent on [https://predictabledialogs.com](https://predictabledialogs.com)

## Installation

### Using npm

To install, run:

```bash
npm install agent-embed
```

## Standard Embed

 Here is a code example:

```html
<script type="module">
  import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@0.1/dist/web.js'

  Agent.initStandard({
    agentName: 'my-agent', // this agent is created on predictable dialogs.
  })
</script>

<agent-standard style="width: 100%; height: 600px; "></agent-standard>
```

This code is creating a container with a 100% width (will match parent width) and 600px height.

## Popup

Here is an example:

```html
<script type="module">
  import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@0.1/dist/web.js'

  Agent.initPopup({
    agentName: 'my-agent',
    autoShowDelay: 3000,
  })
</script>
```

This code will automatically trigger the popup window after 3 seconds.

### Open or Close a popup

You can use these commands:

```js
Agent.open()
```

```js
Agent.close()
```

```js
Agent.toggle()
```

You can bind these commands on a button element, for example:

```html
<button onclick="Agent.open()">Contact us</button>
```

## Bubble

Here is an example:

```html
<script type="module">
  import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@0.1/dist/web.js'

  Agent.initBubble({
    agentName: 'my-agent',
    previewMessage: {
      message: 'I have a question for you!',
      autoShowDelay: 5000,
      avatarUrl: 'https://avatars.githubusercontent.com/u/3472565?v=4',
    },
    theme: {
      button: { backgroundColor: '#0042DA', iconColor: '#FFFFFF' },
      previewMessage: { backgroundColor: '#ffffff', textColor: 'black' },
      chatWindow: { backgroundColor: '#ffffff' },
    },
  })
</script>
```

This code will show the bubble and let a preview message appear after 5 seconds.

### Open or close the preview message

You can use these commands:

```js
Agent.showPreviewMessage()
```

```js
Agent.hidePreviewMessage()
```

### Open or close the agent

You can use these commands:

```js
Agent.open()
```

```js
Agent.close()
```

```js
Agent.toggle()
```

You can bind these commands on a button element, for example:

```html
<button onclick="Agent.open()">Contact us</button>
```
