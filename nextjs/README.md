
cd dist
find . -type f -name 'web-*.js' ! -name 'web-81fd1a82.js' -exec rm -f {} \;
find . -type f -name 'Bubble-*.js' ! -name 'Bubble-c3d2bf31.js' -exec rm -f {} \;
find . -type f -name 'Popup-*.js' ! -name 'Popup-c8fc5a40.js' -exec rm -f {} \;
find . -type f -name 'Standard-*.js' ! -name 'Standard-6d025eb2.js' -exec rm -f {} \;


## Install

```bash
npm install @agent-widget/nextjs
```

## Standard

```tsx
import { Standard } from '@agent-widget/nextjs'

const App = () => {
  return (
    <Standard
      agentName="my-agent"
      style={{ width: '100%', height: '600px' }}
    />
  )
}
```

This code is creating a container with a 100% width (will match parent width) and 600px height.

## Popup

```tsx
import { Popup } from '@agent-widget/nextjs'

const App = () => {
  return <Popup agentName="my-agent" autoShowDelay={3000} />
}
```

This code will automatically trigger the popup window after 3 seconds.

### Open or Close a popup

You can use these commands:

```js
import { open } from '@agent-widget/nextjs'

open()
```

```js
import { close } from '@agent-widget/nextjs'

close()
```

```js
import { toggle } from '@agent-widget/nextjs'

toggle()
```

## Bubble

```tsx
import { Bubble } from '@agent-widget/nextjs'

const App = () => {
  return (
    <Bubble
      agentName="my-agent"
      previewMessage={{
        message: 'I have a question for you!',
        autoShowDelay: 5000,
        avatarUrl: 'https://avatars.githubusercontent.com/u/16015833?v=4',
      }}
      theme={{
        button: { backgroundColor: '#0042DA', iconColor: '#FFFFFF' },
        previewMessage: { backgroundColor: '#ffffff', textColor: 'black' },
      }}
    />
  )
}
```

This code will show the bubble and let a preview message appear after 5 seconds.

### Open or close the preview message

You can use these commands:

```js
import { showPreviewMessage } from '@agent-widget/nextjs'

Agent.showPreviewMessage()
```

```js
import { hidePreviewMessage } from '@agent-widget/nextjs'

Agent.hidePreviewMessage()
```

### Open or close the chat window

You can use these commands:

```js
import { open } from '@agent-widget/nextjs'

open()
```

```js
import { close } from '@agent-widget/nextjs'

close()
```

```js
import { toggle } from '@agent-widget/nextjs'

toggle()
```

## Additional configuration

You can prefill the bot variable values in your embed code by adding the `prefilledVariables` option. Here is an example:

```tsx
import { Standard } from '@agent-widget/nextjs'

const App = () => {
  return (
    <Standard
      agentName="my-agent"
      style={{ width: '100%', height: '600px' }}
      prefilledVariables={{
        'Current URL': 'https://my-site/account',
        'User name': 'John Doe',
      }}
    />
  )
}
```